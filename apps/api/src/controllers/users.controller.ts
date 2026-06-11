import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Rarity, Verdict } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { achievementService } from '../services/achievement.service';

const RARITY_ORDER: Record<Rarity, number> = {
  LEGENDARY: 0,
  EPIC: 1,
  RARE: 2,
  COMMON: 3,
};

export const UpdateProfileSchema = z.object({
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
});

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getUserByUsername(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        streak: true,
        maxStreak: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [acceptedSubmissions, totalSubmissions, difficultyCounts, recentAccepted] =
      await Promise.all([
        prisma.submission.findMany({
          where: { userId: user.id, verdict: 'ACCEPTED' },
          select: { problemId: true, problem: { select: { difficulty: true } } },
          distinct: ['problemId'],
        }),
        prisma.submission.count({ where: { userId: user.id } }),
        prisma.submission.groupBy({
          by: ['problemId'],
          where: { userId: user.id, verdict: 'ACCEPTED' },
        }).then(async (groups) => {
          const problemIds = groups.map((g) => g.problemId);
          const problems = await prisma.problem.findMany({
            where: { id: { in: problemIds } },
            select: { difficulty: true },
          });
          return {
            easy: problems.filter((p) => p.difficulty === 'EASY').length,
            medium: problems.filter((p) => p.difficulty === 'MEDIUM').length,
            hard: problems.filter((p) => p.difficulty === 'HARD').length,
          };
        }),
        prisma.submission.findMany({
          where: { userId: user.id, verdict: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            language: true,
            runtime: true,
            createdAt: true,
            problem: { select: { title: true } },
          },
        }),
      ]);

    res.json({
      ...user,
      problemsSolved: acceptedSubmissions.length,
      totalSubmissions,
      easyCount: difficultyCounts.easy,
      mediumCount: difficultyCounts.medium,
      hardCount: difficultyCounts.hard,
      recentAccepted: recentAccepted.map((s) => ({
        id: s.id,
        problemTitle: s.problem.title,
        language: s.language,
        runtime: s.runtime,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as z.infer<typeof UpdateProfileSchema>;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
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
        role: true,
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getMyAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const achievements = await achievementService.getUserAchievements(req.user!.id);

    const result = achievements
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      });

    res.json({ achievements: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setUTCDate(yearAgo.getUTCDate() - 365);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const [verdictGroups, problemsSolved, submissions, xpSubmissions] = await Promise.all([
      prisma.submission.groupBy({
        by: ['verdict'],
        where: { userId },
        _count: { id: true },
      }),
      prisma.submission.findMany({
        where: { userId, verdict: 'ACCEPTED' },
        select: { problemId: true },
        distinct: ['problemId'],
      }),
      prisma.submission.findMany({
        where: { userId, createdAt: { gte: yearAgo } },
        select: { createdAt: true },
      }),
      prisma.submission.findMany({
        where: {
          userId,
          verdict: 'ACCEPTED',
          xpEarned: { gt: 0 },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true, xpEarned: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const verdictCounts: Record<string, number> = {};
    for (const v of Object.values(Verdict)) {
      verdictCounts[v] = 0;
    }
    for (const group of verdictGroups) {
      verdictCounts[group.verdict] = group._count.id;
    }

    const heatmapMap = new Map<string, number>();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      heatmapMap.set(formatUtcDate(d), 0);
    }
    for (const sub of submissions) {
      const date = formatUtcDate(sub.createdAt);
      if (heatmapMap.has(date)) {
        heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + 1);
      }
    }

    const heatmap = Array.from(heatmapMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const xpHistoryMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      xpHistoryMap.set(formatUtcDate(d), 0);
    }
    for (const sub of xpSubmissions) {
      const date = formatUtcDate(sub.createdAt);
      if (xpHistoryMap.has(date)) {
        xpHistoryMap.set(date, (xpHistoryMap.get(date) ?? 0) + sub.xpEarned);
      }
    }

    const xpHistory = Array.from(xpHistoryMap.entries())
      .map(([date, xp]) => ({ date, xp }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      verdictCounts,
      problemsSolved: problemsSolved.length,
      heatmap,
      xpHistory,
    });
  } catch (err) {
    next(err);
  }
}
