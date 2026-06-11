import { Achievement, Problem, Submission, User } from '@prisma/client';
import { prisma } from '../lib/prisma';

export type AchievementWithStatus = Achievement & {
  unlocked: boolean;
  unlockedAt: Date | null;
};

type SubmissionWithRelations = Submission & { problem: Problem; user: User };

async function unlockAchievement(userId: string, slug: string): Promise<Achievement | null> {
  const achievement = await prisma.achievement.findUnique({ where: { slug } });
  if (!achievement) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return null;

  await prisma.$transaction([
    prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: achievement.xpReward } },
    }),
  ]);

  return achievement;
}

async function checkFirstBlood(userId: string): Promise<Achievement | null> {
  const count = await prisma.submission.count({
    where: { userId, verdict: 'ACCEPTED' },
  });
  if (count === 1) return unlockAchievement(userId, 'first_blood');
  return null;
}

async function checkProblemMilestones(userId: string): Promise<Achievement[]> {
  const solved = await prisma.submission.findMany({
    where: { userId, verdict: 'ACCEPTED' },
    select: { problemId: true },
    distinct: ['problemId'],
  });
  const count = solved.length;
  const unlocked: Achievement[] = [];
  if (count >= 10) {
    const a = await unlockAchievement(userId, 'problem_10');
    if (a) unlocked.push(a);
  }
  if (count >= 50) {
    const a = await unlockAchievement(userId, 'problem_50');
    if (a) unlocked.push(a);
  }
  if (count >= 100) {
    const a = await unlockAchievement(userId, 'problem_100');
    if (a) unlocked.push(a);
  }
  return unlocked;
}

async function checkStreakAchievements(userId: string): Promise<Achievement[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const unlocked: Achievement[] = [];
  if (user.streak >= 7) {
    const a = await unlockAchievement(userId, 'streak_7');
    if (a) unlocked.push(a);
  }
  if (user.streak >= 30) {
    const a = await unlockAchievement(userId, 'streak_30');
    if (a) unlocked.push(a);
  }
  return unlocked;
}

async function checkBugHunter(userId: string): Promise<Achievement | null> {
  const count = await prisma.submission.count({
    where: { userId, verdict: 'RUNTIME_ERROR' },
  });
  if (count >= 10) return unlockAchievement(userId, 'bug_hunter');
  return null;
}

async function checkSpeedDemon(submission: Submission): Promise<Achievement | null> {
  if (
    submission.verdict === 'ACCEPTED' &&
    submission.runtime !== null &&
    submission.runtime < 10
  ) {
    return unlockAchievement(submission.userId, 'speed_demon');
  }
  return null;
}

async function checkPolyglot(userId: string): Promise<Achievement | null> {
  const languages = await prisma.submission.findMany({
    where: { userId, verdict: 'ACCEPTED' },
    select: { language: true },
    distinct: ['language'],
  });
  if (languages.length >= 3) return unlockAchievement(userId, 'polyglot');
  return null;
}

async function checkNightOwl(submission: Submission): Promise<Achievement | null> {
  const hour = submission.createdAt.getUTCHours();
  if (hour >= 2 && hour < 4) {
    return unlockAchievement(submission.userId, 'night_owl');
  }
  return null;
}

async function checkHardFirst(
  userId: string,
  submission: SubmissionWithRelations
): Promise<Achievement | null> {
  const count = await prisma.submission.count({
    where: { userId, verdict: 'ACCEPTED' },
  });
  if (count === 1 && submission.problem.difficulty === 'HARD') {
    return unlockAchievement(userId, 'hard_first');
  }
  return null;
}

const CHAPTER_BADGE_SLUGS: Record<number, string> = {
  1: 'chapter_seedling',
  2: 'chapter_spark',
  3: 'chapter_charged',
  4: 'chapter_crystal',
  5: 'chapter_master',
};

async function unlockChapterBadge(
  userId: string,
  chapterId: number,
  _badgeLabel: string
): Promise<Achievement | null> {
  const slug = CHAPTER_BADGE_SLUGS[chapterId];
  if (!slug) return null;
  return unlockAchievement(userId, slug);
}

async function unlockPetSolveAchievement(userId: string): Promise<Achievement | null> {
  return unlockAchievement(userId, 'smart_delegator');
}

async function checkPetEvolution(userId: string): Promise<void> {
  const solved = await prisma.submission.findMany({
    where: { userId, verdict: 'ACCEPTED' },
    select: { problemId: true },
    distinct: ['problemId'],
  });
  // Evolution is client-side; this hook allows future server-side notifications
  void solved.length;
}

async function checkAndUnlock(
  userId: string,
  submission: SubmissionWithRelations
): Promise<Achievement[]> {
  const results = await Promise.all([
    checkFirstBlood(userId),
    checkProblemMilestones(userId),
    checkStreakAchievements(userId),
    checkBugHunter(userId),
    checkSpeedDemon(submission),
    checkPolyglot(userId),
    checkNightOwl(submission),
    checkHardFirst(userId, submission),
  ]);

  return results.flat().filter((a): a is Achievement => a !== null);
}

async function getUserAchievements(userId: string): Promise<AchievementWithStatus[]> {
  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return achievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}

export const achievementService = {
  checkAndUnlock,
  getUserAchievements,
  unlockChapterBadge,
  unlockPetSolveAchievement,
  checkPetEvolution,
};
