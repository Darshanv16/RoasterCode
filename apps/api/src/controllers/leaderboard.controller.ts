import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

const LeaderboardQuerySchema = z.object({
  by: z.enum(['xp', 'problems', 'streak']).default('xp'),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

type LeaderboardBy = z.infer<typeof LeaderboardQuerySchema>['by'];

async function getXpLeaderboard(limit: number) {
  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: limit,
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      xp: true,
      level: true,
      streak: true,
    },
  });

  return users.map((u, i) => ({
    rank: i + 1,
    username: u.username,
    avatarUrl: u.avatarUrl,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    _userId: u.id,
  }));
}

async function getStreakLeaderboard(limit: number) {
  const users = await prisma.user.findMany({
    orderBy: [{ streak: 'desc' }, { maxStreak: 'desc' }],
    take: limit,
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      streak: true,
      maxStreak: true,
      xp: true,
      level: true,
    },
  });

  return users.map((u, i) => ({
    rank: i + 1,
    username: u.username,
    avatarUrl: u.avatarUrl,
    streak: u.streak,
    maxStreak: u.maxStreak,
    xp: u.xp,
    level: u.level,
    _userId: u.id,
  }));
}

async function getProblemsLeaderboard(limit: number) {
  type Row = { userId: string; problemsSolved: number };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT s."userId", COUNT(DISTINCT s."problemId")::int AS "problemsSolved"
    FROM "Submission" s
    WHERE s.verdict = 'ACCEPTED'
    GROUP BY s."userId"
    ORDER BY "problemsSolved" DESC
    LIMIT ${limit}
  `;

  if (rows.length === 0) return [];

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      xp: true,
      level: true,
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((row, i) => {
    const user = userMap.get(row.userId)!;
    return {
      rank: i + 1,
      username: user.username,
      avatarUrl: user.avatarUrl,
      problemsSolved: row.problemsSolved,
      xp: user.xp,
      level: user.level,
      _userId: row.userId,
    };
  });
}

async function fetchLeaderboard(by: LeaderboardBy, limit: number) {
  switch (by) {
    case 'xp':
      return getXpLeaderboard(limit);
    case 'streak':
      return getStreakLeaderboard(limit);
    case 'problems':
      return getProblemsLeaderboard(limit);
  }
}

async function getUserXpRank(userId: string, xp: number): Promise<number> {
  const higher = await prisma.user.count({ where: { xp: { gt: xp } } });
  return higher + 1;
}

async function getUserStreakRank(
  userId: string,
  streak: number,
  maxStreak: number
): Promise<number> {
  const higher = await prisma.user.count({
    where: {
      OR: [
        { streak: { gt: streak } },
        { streak, maxStreak: { gt: maxStreak } },
      ],
    },
  });
  return higher + 1;
}

async function getUserProblemsRank(userId: string): Promise<{ rank: number; problemsSolved: number }> {
  type Row = { problemsSolved: number; rank: bigint };
  const result = await prisma.$queryRaw<Row[]>`
    WITH ranked AS (
      SELECT
        s."userId",
        COUNT(DISTINCT s."problemId")::int AS "problemsSolved",
        RANK() OVER (ORDER BY COUNT(DISTINCT s."problemId") DESC) AS rank
      FROM "Submission" s
      WHERE s.verdict = 'ACCEPTED'
      GROUP BY s."userId"
    )
    SELECT "problemsSolved", rank
    FROM ranked
    WHERE "userId" = ${userId}
  `;

  if (result.length === 0) {
    return { rank: 0, problemsSolved: 0 };
  }

  return {
    rank: Number(result[0].rank),
    problemsSolved: result[0].problemsSolved,
  };
}

async function buildYourEntry(
  by: LeaderboardBy,
  userId: string,
  leaderboard: Array<{ rank: number; _userId: string }>
) {
  const inList = leaderboard.find((e) => e._userId === userId);
  if (inList) {
    const { _userId, ...entry } = inList as Record<string, unknown>;
    return entry;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      avatarUrl: true,
      xp: true,
      level: true,
      streak: true,
      maxStreak: true,
    },
  });
  if (!user) return null;

  switch (by) {
    case 'xp': {
      const rank = await getUserXpRank(userId, user.xp);
      return {
        rank,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      };
    }
    case 'streak': {
      const rank = await getUserStreakRank(userId, user.streak, user.maxStreak);
      return {
        rank,
        username: user.username,
        avatarUrl: user.avatarUrl,
        streak: user.streak,
        maxStreak: user.maxStreak,
        xp: user.xp,
        level: user.level,
      };
    }
    case 'problems': {
      const { rank, problemsSolved } = await getUserProblemsRank(userId);
      if (rank === 0) return null;
      return {
        rank,
        username: user.username,
        avatarUrl: user.avatarUrl,
        problemsSolved,
        xp: user.xp,
        level: user.level,
      };
    }
  }
}

export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = LeaderboardQuerySchema.parse(req.query);
    const userId = req.user?.id ?? null;
    const cacheKey = JSON.stringify({ ...query, userId });

    const cached = getCached<{ leaderboard: unknown[]; yourEntry: unknown }>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const raw = await fetchLeaderboard(query.by, query.limit);
    const leaderboard = raw.map(({ _userId, ...entry }) => entry);

    let yourEntry: Record<string, unknown> | null = null;
    if (userId) {
      yourEntry = (await buildYourEntry(query.by, userId, raw)) as Record<string, unknown> | null;
    }

    const result = { leaderboard, yourEntry };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
