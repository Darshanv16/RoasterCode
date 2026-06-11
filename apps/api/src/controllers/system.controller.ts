import { Request, Response, NextFunction } from 'express';
import { getLanguageAvailability } from '../services/judge0.service';

export async function getLanguages(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const languages = await getLanguageAvailability();
    res.json({ languages });
  } catch (err) {
    next(err);
  }
}
