import { Request, Response, NextFunction } from 'express';
import { RoastRequest } from '@roastcoder/shared';
import { prisma } from '../lib/prisma';
import { generateRoast, getRoastForSubmission } from '../services/roast.service';

export async function createRoast(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req.body as RoastRequest;
    const response = await generateRoast(request);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getRoastBySubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (submission.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const roast = await getRoastForSubmission(submissionId);

    if (!roast) {
      res.status(404).json({ error: 'Roast not found' });
      return;
    }

    res.json({
      verdict: roast.verdict,
      mood: roast.mood,
      roast: roast.roast,
      explanation: roast.explanation,
      hint: roast.hint,
      createdAt: roast.createdAt,
    });
  } catch (err) {
    next(err);
  }
}
