import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { bustProblemListCache, computeAcceptanceRate } from './problems.controller';

function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const startOfToday = startOfTodayUtc();

    const [totalUsers, totalProblems, submissionsToday, accepted, total, activeUsersToday] =
      await Promise.all([
        prisma.user.count(),
        prisma.problem.count(),
        prisma.submission.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.submission.count({ where: { verdict: 'ACCEPTED' } }),
        prisma.submission.count({ where: { verdict: { not: 'PENDING' } } }),
        prisma.submission.findMany({
          where: { createdAt: { gte: startOfToday } },
          select: { userId: true },
          distinct: ['userId'],
        }),
      ]);

    const acceptanceRate =
      total === 0 ? 0 : Math.round((accepted / total) * 10000) / 100;

    res.json({
      totalUsers,
      totalProblems,
      submissionsToday,
      acceptanceRate,
      activeUsersToday: activeUsersToday.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProblems(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        xpReward: true,
        isPublished: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const problemsWithStats = await Promise.all(
      problems.map(async (p) => {
        const [totalAttempts, acceptanceRate] = await Promise.all([
          prisma.submission.count({
            where: { problemId: p.id, verdict: { not: 'PENDING' } },
          }),
          computeAcceptanceRate(p.id),
        ]);
        return { ...p, totalAttempts, acceptanceRate };
      })
    );

    res.json({ problems: problemsWithStats });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProblemById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: {
        examples: { orderBy: { order: 'asc' } },
        testCases: { orderBy: { order: 'asc' } },
      },
    });

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json(problem);
  } catch (err) {
    next(err);
  }
}

export async function togglePublish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await prisma.problem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: { isPublished: !existing.isPublished },
      select: { id: true, isPublished: true },
    });

    bustProblemListCache();
    res.json(problem);
  } catch (err) {
    next(err);
  }
}
