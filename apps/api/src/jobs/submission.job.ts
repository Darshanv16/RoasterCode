import { prisma } from '../lib/prisma';
import { runAllTestCases, determineVerdict } from '../services/judge0.service';
import { xpService } from '../services/xp.service';
import { achievementService } from '../services/achievement.service';
import { creditService } from '../services/credit.service';
import { learningService } from '../services/learning.service';
import { generateAndSave } from '../services/roast.service';

export async function processSubmission(submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: {
      problem: { include: { testCases: { orderBy: { order: 'asc' } } } },
      user: true,
    },
  });

  const testCases = submission.problem.testCases.map((tc) => ({
    id: tc.id,
    input: tc.input,
    expected: tc.expected,
  }));

  const results = await runAllTestCases({
    sourceCode: submission.code,
    language: submission.language,
    testCases,
    timeLimit: submission.problem.timeLimit,
    memoryLimit: submission.problem.memoryLimit,
  });

  const verdict = determineVerdict(results);

  const passedResults = results.filter((r) => r.passed);
  const runtime =
    passedResults.length > 0
      ? Math.round(
          passedResults.reduce((sum, r) => sum + (r.runtime ?? 0), 0) /
            passedResults.length
        )
      : null;

  const memoryValues = results.map((r) => r.memory).filter((m): m is number => m !== null);
  const memory = memoryValues.length > 0 ? Math.max(...memoryValues) : null;

  const passedTests = results.filter((r) => r.passed).length;
  const totalTests = results.length;

  const firstError = results.find((r) => r.errorMessage)?.errorMessage ?? null;
  const firstFailing = results.find((r) => !r.passed);

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      verdict,
      runtime,
      memory,
      passedTests,
      totalTests,
      errorMessage: firstError,
      expectedOutput: firstFailing?.expectedOutput ?? null,
      actualOutput: firstFailing?.actualOutput ?? null,
    },
  });

  if (verdict === 'ACCEPTED') {
    const xpEarned = await xpService.awardXp(
      submission.userId,
      submission.problemId,
      submission.problem.difficulty,
      submissionId
    );

    await prisma.submission.update({
      where: { id: submissionId },
      data: { xpEarned },
    });

    const updatedSubmission = await prisma.submission.findUniqueOrThrow({
      where: { id: submissionId },
      include: { problem: true, user: true },
    });

    await achievementService.checkAndUnlock(submission.userId, updatedSubmission);

    const previousAccepted = await prisma.submission.findFirst({
      where: {
        userId: submission.userId,
        problemId: submission.problemId,
        verdict: 'ACCEPTED',
        id: { not: submissionId },
      },
      select: { id: true },
    });

    if (!previousAccepted) {
      await creditService.awardCredits(
        submission.userId,
        submission.problem.difficulty,
        submission.problem.title
      );
    }

    await learningService.checkAndCompleteChapters(submission.userId);
  }

  await generateAndSave(submissionId);
}

export async function addSubmissionJob(_submissionId: string): Promise<boolean> {
  return false;
}
