import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { creditService } from '../services/credit.service';
import {
  getRefreshTokenFromCookie,
  refreshTokenCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from '../lib/cookies';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores only'),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

interface AccessTokenPayload {
  id: string;
  username: string;
  role: Role;
}

interface RefreshTokenPayload {
  id: string;
}

function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

function formatAuthResponse(user: {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  role: Role;
}, accessToken: string) {
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      role: user.role,
    },
    accessToken,
  };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body as z.infer<typeof RegisterSchema>;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        userCredits: { create: { credits: 0 } },
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
    res.status(201).json(formatAuthResponse(user, accessToken));
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    console.log("User found:", !!user);
    console.log("Password entered:", password);
    console.log("Password valid:", await bcrypt.compare(password, user.passwordHash));

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    await creditService.awardDailyLoginBonus(user.id);

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
    res.json(formatAuthResponse(user, accessToken));
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = getRefreshTokenFromCookie(req);

    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = getRefreshTokenFromCookie(req);

    if (!token) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as RefreshTokenPayload;
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newRefreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt,
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, refreshTokenCookieOptions);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        streak: true,
        maxStreak: true,
        lastActiveAt: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const solvedCount = await prisma.submission.findMany({
      where: { userId: user.id, verdict: 'ACCEPTED' },
      select: { problemId: true },
      distinct: ['problemId'],
    });

    res.json({ user: { ...user, problemsSolved: solvedCount.length } });
  } catch (err) {
    next(err);
  }
}
