import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const SAVE_INTERVAL_MS = 30_000;

function draftKey(slug: string, language: string) {
  return `roastcoder:draft:${slug}:${language}`;
}

export function useAutoSave(problemSlug: string, code: string, language: string) {
  useEffect(() => {
    const key = draftKey(problemSlug, language);
    const interval = setInterval(() => {
      localStorage.setItem(key, code);
      toast('Draft saved', { duration: 1500 });
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [problemSlug, language, code]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey(problemSlug, language));
  }, [problemSlug, language]);

  return { clearDraft };
}

export function loadDraft(slug: string, language: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(draftKey(slug, language));
}
