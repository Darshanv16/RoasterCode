import { notFound } from 'next/navigation';
import { EditorPage } from './EditorPage';
import type { ProblemDetail } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getProblem(slug: string): Promise<ProblemDetail | null> {
  try {
    const res = await fetch(`${API_URL}/problems/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = await getProblem(params.slug);
  if (!problem) notFound();
  return <EditorPage problem={problem} />;
}
