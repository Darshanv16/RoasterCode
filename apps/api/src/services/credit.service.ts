import { Difficulty } from '@prisma/client';
import { prisma } from '../lib/prisma';

const DIFFICULTY_CREDITS: Record<Difficulty, number> = {
  EASY: 10,
  MEDIUM: 20,
  HARD: 40,
};

const DAILY_LOGIN_CREDITS = 5;
const STREAK_MILESTONE_CREDITS = 25;
const STREAK_MILESTONE_INTERVAL = 7;

export class InsufficientCreditsError extends Error {
  statusCode = 402;

  constructor(message = 'Insufficient credits') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

async function ensureUserCredits(userId: string) {
  return prisma.userCredits.upsert({
    where: { userId },
    create: { userId, credits: 0 },
    update: {},
  });
}

async function recordTransaction(userId: string, amount: number, reason: string) {
  await prisma.creditTransaction.create({
    data: { userId, amount, reason },
  });
}

export async function getCredits(userId: string): Promise<number> {
  const record = await ensureUserCredits(userId);
  return record.credits;
}

export async function getCreditHistory(userId: string, limit = 10) {
  await ensureUserCredits(userId);
  return prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { amount: true, reason: true, createdAt: true },
  });
}

export async function addCredits(userId: string, amount: number, reason: string): Promise<number> {
  await ensureUserCredits(userId);
  const updated = await prisma.userCredits.update({
    where: { userId },
    data: { credits: { increment: amount } },
  });
  await recordTransaction(userId, amount, reason);
  return updated.credits;
}

export async function spendCredits(userId: string, amount: number, reason: string): Promise<number> {
  const record = await ensureUserCredits(userId);
  if (record.credits < amount) {
    throw new InsufficientCreditsError();
  }
  const updated = await prisma.userCredits.update({
    where: { userId },
    data: { credits: { decrement: amount } },
  });
  await recordTransaction(userId, -amount, reason);
  return updated.credits;
}

export async function awardCredits(
  userId: string,
  difficulty: Difficulty,
  problemTitle: string
): Promise<number> {
  const amount = DIFFICULTY_CREDITS[difficulty];
  return addCredits(userId, amount, `Solved ${problemTitle}`);
}

export async function awardChapterCredits(userId: string, chapterName: string): Promise<number> {
  return addCredits(userId, 50, `Completed chapter: ${chapterName}`);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function awardDailyLoginBonus(userId: string): Promise<number | null> {
  const startOfDay = startOfUtcDay(new Date());
  const existing = await prisma.creditTransaction.findFirst({
    where: {
      userId,
      reason: 'Daily login bonus',
      createdAt: { gte: startOfDay },
    },
  });
  if (existing) return null;

  return addCredits(userId, DAILY_LOGIN_CREDITS, 'Daily login bonus');
}

export async function awardStreakMilestoneCredits(
  userId: string,
  previousStreak: number,
  newStreak: number
): Promise<number | null> {
  const prevMilestone = Math.floor(previousStreak / STREAK_MILESTONE_INTERVAL);
  const newMilestone = Math.floor(newStreak / STREAK_MILESTONE_INTERVAL);

  if (newMilestone > prevMilestone && newStreak >= STREAK_MILESTONE_INTERVAL) {
    return addCredits(
      userId,
      STREAK_MILESTONE_CREDITS,
      `${newStreak}-day streak milestone`
    );
  }
  return null;
}

export const PET_SOLVE_COSTS: Record<Difficulty, number> = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 200,
};

export const PET_HINT_COST = 10;
export const HINT_PACK_COST = 15;

export const creditService = {
  getCredits,
  getCreditHistory,
  addCredits,
  spendCredits,
  awardCredits,
  awardChapterCredits,
  awardDailyLoginBonus,
  awardStreakMilestoneCredits,
  PET_SOLVE_COSTS,
  PET_HINT_COST,
  HINT_PACK_COST,
};
