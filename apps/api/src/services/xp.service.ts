import { Difficulty } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { creditService } from './credit.service';

const BASE_XP: Record<Difficulty, number> = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 200,
};

const FIRST_SOLVE_BONUS = 25;
const STREAK_XP_PER_DAY = 10;
const MAX_STREAK_BONUS = 100;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime();
}

function isYesterdayUtc(lastActive: Date, now: Date): boolean {
  const yesterday = startOfUtcDay(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return startOfUtcDay(lastActive).getTime() === yesterday.getTime();
}

function computeNewStreak(lastActiveAt: Date, currentStreak: number, now: Date): number {
  if (isSameUtcDay(lastActiveAt, now)) {
    return currentStreak;
  }
  if (isYesterdayUtc(lastActiveAt, now)) {
    return currentStreak + 1;
  }
  return 1;
}

export async function awardXp(
  userId: string,
  problemId: string,
  difficulty: Difficulty,
  submissionId: string
): Promise<number> {
  const [user, previousAccepted] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.submission.findFirst({
      where: {
        userId,
        problemId,
        verdict: 'ACCEPTED',
        id: { not: submissionId },
      },
      select: { id: true },
    }),
  ]);

  const isFirstSolve = !previousAccepted;
  const baseXp = BASE_XP[difficulty];
  const firstSolveBonus = isFirstSolve ? FIRST_SOLVE_BONUS : 0;

  const now = new Date();
  const newStreak = computeNewStreak(user.lastActiveAt, user.streak, now);
  const streakBonus = Math.min(newStreak * STREAK_XP_PER_DAY, MAX_STREAK_BONUS);

  const totalXp = baseXp + firstSolveBonus + streakBonus;
  const newXp = user.xp + totalXp;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      maxStreak: Math.max(user.maxStreak, newStreak),
      lastActiveAt: now,
    },
  });

  await creditService.awardStreakMilestoneCredits(userId, user.streak, newStreak);

  return totalXp;
}

export const xpService = { awardXp };
