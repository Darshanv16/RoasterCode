import { ProblemsPageClient } from './ProblemsPageClient';
import type { ProblemListItem } from '@/lib/api';

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getProblems(): Promise<ProblemListItem[]> {
  try {
    const res = await fetch(`${API_URL}/problems?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.problems ?? [];
  } catch {
    return [];
  }
}

export default async function ProblemsPage() {
  const initialProblems = await getProblems();
  return <ProblemsPageClient initialProblems={initialProblems} />;
}
