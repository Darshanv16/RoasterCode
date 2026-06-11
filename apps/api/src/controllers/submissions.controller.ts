import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { addSubmissionJob, processSubmission } from '../jobs/submission.job';
import { runAllTestCases } from '../services/judge0.service';

export const CreateSubmissionSchema = z.object({
  problemId: z.string().cuid(),
  code: z.string().min(1).max(50000),
  language: z.enum(['python', 'javascript']),
});

export const RunCodeSchema = z.object({
  problemId: z.string().cuid(),
  code: z.string().min(1).max(50000),
  language: z.enum(['python', 'javascript']),
  customTestCases: z
    .array(z.object({ input: z.string(), expected: z.string().optional() }))
    .optional(),
});

export async function createSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, code, language } = req.body as z.infer<typeof CreateSubmissionSchema>;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });

    if (!problem || !problem.isPublished) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const submission = await prisma.submission.create({
      data: {
        userId: req.user!.id,
        problemId,
        code,
        language,
        verdict: 'PENDING',
      },
    });

    const queued = await addSubmissionJob(submission.id);
    if (!queued) {
      await processSubmission(submission.id);
    }

    res.status(202).json({ submissionId: submission.id });
  } catch (err) {
    next(err);
  }
}

export async function getSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { roast: true },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (submission.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: submission.id,
      code: submission.code,
      language: submission.language,
      verdict: submission.verdict,
      runtime: submission.runtime,
      memory: submission.memory,
      passedTests: submission.passedTests,
      totalTests: submission.totalTests,
      errorMessage: submission.errorMessage,
      expectedOutput: submission.expectedOutput,
      actualOutput: submission.actualOutput,
      xpEarned: submission.xpEarned,
      roastGenerated: submission.roastGenerated,
      createdAt: submission.createdAt,
      roast: submission.roastGenerated && submission.roast
        ? {
            verdict: submission.roast.verdict,
            mood: submission.roast.mood,
            roast: submission.roast.roast,
            explanation: submission.roast.explanation,
            hint: submission.roast.hint,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubmissionsByProblem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: req.user!.id,
        problemId: req.params.problemId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        verdict: true,
        language: true,
        runtime: true,
        memory: true,
        createdAt: true,
      },
    });

    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

export async function runCode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, code, language, customTestCases } = req.body as z.infer<
      typeof RunCodeSchema
    >;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: { isHidden: false },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!problem || !problem.isPublished) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const testCases = [
      ...problem.testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
      })),
      ...(customTestCases ?? []).map((tc, i) => ({
        id: `custom-${i}`,
        input: tc.input,
        expected: tc.expected ?? '',
      })),
    ];

    if (testCases.length === 0) {
      res.status(400).json({ error: 'No test cases to run' });
      return;
    }

    const results = await runAllTestCases({
      sourceCode: code,
      language,
      testCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    });

    const compileError = results.find((r) => r.statusId === 6)?.errorMessage ?? null;

    res.json({
      results: results.map((r) => ({
        testCaseId: r.testCaseId,
        passed: r.passed,
        actualOutput: r.actualOutput,
        expectedOutput: r.expectedOutput,
        runtime: r.runtime,
        errorMessage: r.errorMessage,
      })),
      passed: results.filter((r) => r.passed).length,
      total: results.length,
      compileError,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMySubmissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        verdict: true,
        language: true,
        runtime: true,
        createdAt: true,
        problem: { select: { title: true } },
      },
    });

    res.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        problemTitle: s.problem.title,
        verdict: s.verdict,
        language: s.language,
        runtime: s.runtime,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
