import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  if (err.name === 'ZodError') {
    res.status(400).json({ errors: (err as ZodError).flatten().fieldErrors });
    return;
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
