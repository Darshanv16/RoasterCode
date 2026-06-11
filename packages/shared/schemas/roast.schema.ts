import { z } from 'zod';

export const RoastRequestSchema = z.object({
  verdict: z.string(),
  code: z.string().max(50000),
  language: z.string(),
  problem: z.object({
    title: z.string(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    statement: z.string().max(5000),
  }),
  expectedOutput: z.string().nullable().optional(),
  actualOutput: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});

export type RoastRequest = z.infer<typeof RoastRequestSchema>;
