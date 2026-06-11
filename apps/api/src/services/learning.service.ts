import { prisma } from '../lib/prisma';
import { LEARNING_CHAPTERS } from '../config/learning.config';
import { creditService } from './credit.service';
import { achievementService } from './achievement.service';

type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';

async function getSolvedSlugs(userId: string): Promise<Set<string>> {
  const solved = await prisma.submission.findMany({
    where: { userId, verdict: 'ACCEPTED' },
    select: { problem: { select: { slug: true } } },
    distinct: ['problemId'],
  });
  return new Set(solved.map((s) => s.problem.slug));
}

async function getChapterProgressRecords(userId: string) {
  return prisma.learningProgress.findMany({ where: { userId } });
}

function isChapterComplete(chapterId: number, solvedSlugs: Set<string>): boolean {
  const chapter = LEARNING_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return false;
  return chapter.problemSlugs.every((slug) => solvedSlugs.has(slug));
}

function getChapterStatus(
  chapter: (typeof LEARNING_CHAPTERS)[0],
  solvedSlugs: Set<string>,
  progressMap: Map<number, { startedAt: Date; completedAt: Date | null }>,
  completedChapterIds: Set<number>
): ChapterStatus {
  if (chapter.requiredChapterId !== null && !completedChapterIds.has(chapter.requiredChapterId)) {
    return 'locked';
  }
  if (isChapterComplete(chapter.id, solvedSlugs)) {
    return 'completed';
  }
  if (progressMap.has(chapter.id) || chapter.problemSlugs.some((s) => solvedSlugs.has(s))) {
    return 'in_progress';
  }
  return 'available';
}

async function getProblemsBySlugs(slugs: string[]) {
  return prisma.problem.findMany({
    where: { slug: { in: slugs }, isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      xpReward: true,
    },
  });
}

export async function getLearningPath(userId: string) {
  const [solvedSlugs, progressRecords, problems] = await Promise.all([
    getSolvedSlugs(userId),
    getChapterProgressRecords(userId),
    getProblemsBySlugs(LEARNING_CHAPTERS.flatMap((c) => c.problemSlugs)),
  ]);

  const problemMap = new Map(problems.map((p) => [p.slug, p]));
  const progressMap = new Map(
    progressRecords.map((p) => [p.chapterId, { startedAt: p.startedAt, completedAt: p.completedAt }])
  );

  const completedChapterIds = new Set<number>();
  for (const chapter of LEARNING_CHAPTERS) {
    if (isChapterComplete(chapter.id, solvedSlugs)) {
      completedChapterIds.add(chapter.id);
    }
  }

  const totalProblems = LEARNING_CHAPTERS.reduce((sum, c) => sum + c.problemSlugs.length, 0);
  const solvedInPath = LEARNING_CHAPTERS.flatMap((c) => c.problemSlugs).filter((s) =>
    solvedSlugs.has(s)
  ).length;

  const chapters = LEARNING_CHAPTERS.map((chapter) => {
    const status = getChapterStatus(chapter, solvedSlugs, progressMap, completedChapterIds);
    const chapterProblems = chapter.problemSlugs
      .map((slug) => problemMap.get(slug))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    const solvedCount = chapter.problemSlugs.filter((s) => solvedSlugs.has(s)).length;

    return {
      id: chapter.id,
      name: chapter.name,
      description: chapter.description,
      badge: chapter.badge,
      badgeLabel: chapter.badgeLabel,
      unlockRequirement: chapter.unlockRequirement,
      status,
      problemCount: chapter.problemSlugs.length,
      solvedCount,
      creditsEarned: status === 'completed' ? 50 : 0,
      problems: chapterProblems.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        xpReward: p.xpReward,
        solved: solvedSlugs.has(p.slug),
      })),
    };
  });

  return {
    chapters,
    overallProgress: {
      solved: solvedInPath,
      total: totalProblems,
      percent: totalProblems > 0 ? Math.round((solvedInPath / totalProblems) * 100) : 0,
    },
  };
}

export async function getChapterDetails(userId: string, chapterId: number) {
  const chapter = LEARNING_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return null;

  const path = await getLearningPath(userId);
  const chapterData = path.chapters.find((c) => c.id === chapterId);
  if (!chapterData) return null;

  return chapterData;
}

export async function startChapter(userId: string, chapterId: number) {
  const chapter = LEARNING_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return null;

  const path = await getLearningPath(userId);
  const chapterData = path.chapters.find((c) => c.id === chapterId);
  if (!chapterData || chapterData.status === 'locked') {
    return { error: 'Chapter is locked' as const };
  }

  const progress = await prisma.learningProgress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    create: { userId, chapterId },
    update: {},
  });

  return { progress, chapter: chapterData };
}

export async function checkAndCompleteChapters(userId: string): Promise<void> {
  const solvedSlugs = await getSolvedSlugs(userId);

  for (const chapter of LEARNING_CHAPTERS) {
    if (!isChapterComplete(chapter.id, solvedSlugs)) continue;

    const existing = await prisma.learningProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId: chapter.id } },
    });

    if (existing?.completedAt) continue;

    await prisma.learningProgress.upsert({
      where: { userId_chapterId: { userId, chapterId: chapter.id } },
      create: {
        userId,
        chapterId: chapter.id,
        completedAt: new Date(),
      },
      update: { completedAt: new Date() },
    });

    await creditService.awardChapterCredits(userId, chapter.name);
    await achievementService.unlockChapterBadge(userId, chapter.id, chapter.badgeLabel);
  }

  await achievementService.checkPetEvolution(userId);
}

export const learningService = {
  getLearningPath,
  getChapterDetails,
  startChapter,
  checkAndCompleteChapters,
};
