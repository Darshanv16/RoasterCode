import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { learningService } from '../services/learning.service';

const ChapterIdSchema = z.object({
  id: z.coerce.number().int().min(1).max(5),
});

export async function getLearningPath(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const path = await learningService.getLearningPath(req.user!.id);
    res.json(path);
  } catch (err) {
    next(err);
  }
}

export async function getChapter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = ChapterIdSchema.parse(req.params);
    const chapter = await learningService.getChapterDetails(req.user!.id, id);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

export async function startChapter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = ChapterIdSchema.parse(req.params);
    const result = await learningService.startChapter(req.user!.id, id);
    if (!result) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    if ('error' in result) {
      res.status(403).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
