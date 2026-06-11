import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  creditService,
  InsufficientCreditsError,
  PET_HINT_COST,
  PET_SOLVE_COSTS,
} from '../services/credit.service';
import { petAiService } from '../services/pet-ai.service';
import { achievementService } from '../services/achievement.service';

const PetSolveSchema = z.object({
  problemId: z.string().min(1),
  language: z.string().min(1),
});

const PetHintSchema = z.object({
  problemId: z.string().min(1),
  currentCode: z.string(),
  language: z.string().min(1),
});

export async function getBalance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [balance, history] = await Promise.all([
      creditService.getCredits(req.user!.id),
      creditService.getCreditHistory(req.user!.id, 10),
    ]);
    res.json({ balance, history });
  } catch (err) {
    next(err);
  }
}

export async function petSolve(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, language } = req.body as z.infer<typeof PetSolveSchema>;
    const userId = req.user!.id;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem || !problem.isPublished) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const cost = PET_SOLVE_COSTS[problem.difficulty];
    await creditService.spendCredits(userId, cost, `Pet Solve — ${problem.title}`);

    const { solution, explanation } = await petAiService.generatePetSolution(problem, language);
    const achievement = await achievementService.unlockPetSolveAchievement(userId);

    const balance = await creditService.getCredits(userId);
    res.json({
      solution,
      explanation,
      creditsSpent: cost,
      balance,
      achievement: achievement
        ? { title: achievement.title, icon: achievement.icon }
        : null,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      res.status(402).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function petHint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, currentCode, language } = req.body as z.infer<typeof PetHintSchema>;
    const userId = req.user!.id;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem || !problem.isPublished) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    await creditService.spendCredits(userId, PET_HINT_COST, `Pet Hint — ${problem.title}`);

    const hint = await petAiService.generatePetHint(problem, currentCode, language);
    const balance = await creditService.getCredits(userId);

    res.json({ hint, creditsSpent: PET_HINT_COST, balance });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      res.status(402).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export { PetSolveSchema, PetHintSchema };
