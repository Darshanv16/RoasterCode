import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Difficulty, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

type SolveStatus = 'solved' | 'attempted' | 'unsolved';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const listCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function getCached<T>(key: string): T | null {
  const entry = listCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    listCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  listCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(title: string): Promise<string> {
  let base = slugify(title);
  if (!base) base = 'problem';

  let slug = base;
  let counter = 1;
  while (await prisma.problem.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

const ExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
  order: z.number().int().default(0),
});

const TestCaseSchema = z.object({
  input: z.string(),
  expected: z.string(),
  isHidden: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const CreateProblemSchema = z.object({
  title: z.string().min(1).max(200),
  statement: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  tags: z.array(z.string()).default([]),
  constraints: z.string(),
  starterCode: z.record(z.string()),
  hints: z.array(z.string()).default([]),
  xpReward: z.number().int().positive(),
  timeLimit: z.number().int().positive().default(2000),
  memoryLimit: z.number().int().positive().default(256),
  examples: z.array(ExampleSchema).default([]),
  testCases: z.array(TestCaseSchema).min(1),
});

export const UpdateProblemSchema = CreateProblemSchema.partial();

export const ListProblemsQuerySchema = z.object({
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'acceptance']).default('newest'),
});

export function bustProblemListCache(): void {
  listCache.clear();
}

export async function computeAcceptanceRate(problemId: string): Promise<number> {
  const [accepted, total] = await Promise.all([
    prisma.submission.count({ where: { problemId, verdict: 'ACCEPTED' } }),
    prisma.submission.count({
      where: { problemId, verdict: { not: 'PENDING' } },
    }),
  ]);
  if (total === 0) return 0;
  return Math.round((accepted / total) * 100);
}

async function getSolveStatuses(
  userId: string,
  problemIds: string[]
): Promise<Map<string, SolveStatus>> {
  const submissions = await prisma.submission.findMany({
    where: { userId, problemId: { in: problemIds } },
    select: { problemId: true, verdict: true },
  });

  const statusMap = new Map<string, SolveStatus>();
  for (const id of problemIds) {
    statusMap.set(id, 'unsolved');
  }

  for (const sub of submissions) {
    if (sub.verdict === 'ACCEPTED') {
      statusMap.set(sub.problemId, 'solved');
    } else if (statusMap.get(sub.problemId) !== 'solved') {
      statusMap.set(sub.problemId, 'attempted');
    }
  }

  return statusMap;
}

export async function listProblems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = ListProblemsQuerySchema.parse(req.query);
    const cacheKey = JSON.stringify({ ...query, userId: req.user?.id ?? null });

    const cached = getCached<{ problems: unknown[]; total: number; page: number; totalPages: number }>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const where: Prisma.ProblemWhereInput = { isPublished: true };
    if (query.difficulty) where.difficulty = query.difficulty as Difficulty;
    if (query.tag) where.tags = { has: query.tag };

    const orderBy: Prisma.ProblemOrderByWithRelationInput =
      query.sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          tags: true,
          xpReward: true,
          order: true,
        },
      }),
      prisma.problem.count({ where }),
    ]);

    let sortedProblems = problems;
    if (query.sort === 'acceptance') {
      const rates = await Promise.all(
        problems.map(async (p) => ({
          id: p.id,
          rate: await computeAcceptanceRate(p.id),
        }))
      );
      const rateMap = new Map(rates.map((r) => [r.id, r.rate]));
      sortedProblems = [...problems].sort(
        (a, b) => (rateMap.get(b.id) ?? 0) - (rateMap.get(a.id) ?? 0)
      );
    }

    const acceptanceRates = await Promise.all(
      sortedProblems.map((p) => computeAcceptanceRate(p.id))
    );

    let solveStatusMap: Map<string, SolveStatus> | null = null;
    if (req.user) {
      solveStatusMap = await getSolveStatuses(
        req.user.id,
        sortedProblems.map((p) => p.id)
      );
    }

    const result = {
      problems: sortedProblems.map((p, i) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        xpReward: p.xpReward,
        order: p.order,
        acceptanceRate: acceptanceRates[i],
        ...(solveStatusMap ? { solveStatus: solveStatusMap.get(p.id) } : {}),
      })),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProblemBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const problem = await prisma.problem.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: {
        examples: { orderBy: { order: 'asc' } },
        testCases: {
          where: { isHidden: false },
          orderBy: { order: 'asc' },
          select: { id: true, input: true, order: true },
        },
      },
    });

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const { testCases, ...rest } = problem;
    res.json({ ...rest, testCases });
  } catch (err) {
    next(err);
  }
}

export async function createProblem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as z.infer<typeof CreateProblemSchema>;
    const slug = await generateUniqueSlug(data.title);

    const problem = await prisma.problem.create({
      data: {
        slug,
        title: data.title,
        statement: data.statement,
        difficulty: data.difficulty,
        tags: data.tags,
        constraints: data.constraints,
        starterCode: data.starterCode,
        hints: data.hints,
        xpReward: data.xpReward,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        isPublished: false,
        examples: { create: data.examples },
        testCases: { create: data.testCases },
      },
      include: {
        examples: { orderBy: { order: 'asc' } },
        testCases: { orderBy: { order: 'asc' } },
      },
    });

    res.status(201).json(problem);
  } catch (err) {
    next(err);
  }
}

export async function updateProblem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as z.infer<typeof UpdateProblemSchema>;

    const existing = await prisma.problem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const { examples, testCases, ...problemFields } = data;

    const problem = await prisma.$transaction(async (tx) => {
      if (examples) {
        await tx.example.deleteMany({ where: { problemId: req.params.id } });
      }
      if (testCases) {
        await tx.testCase.deleteMany({ where: { problemId: req.params.id } });
      }

      return tx.problem.update({
        where: { id: req.params.id },
        data: {
          ...problemFields,
          ...(examples ? { examples: { create: examples } } : {}),
          ...(testCases ? { testCases: { create: testCases } } : {}),
        },
        include: {
          examples: { orderBy: { order: 'asc' } },
          testCases: { orderBy: { order: 'asc' } },
        },
      });
    });

    res.json(problem);
  } catch (err) {
    next(err);
  }
}

export async function deleteProblem(
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

    await prisma.problem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
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
      select: { isPublished: true },
    });

    bustProblemListCache();
    res.json(problem);
  } catch (err) {
    next(err);
  }
}
