import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { RoastResponse } from '@roastcoder/shared';

interface RoastRequest {
  verdict: string;
  code: string;
  language: string;
  problem: { title: string; difficulty: string; statement: string };
  expectedOutput?: string | null;
  actualOutput?: string | null;
  errorMessage?: string | null;
}

interface UseRoastEngineReturn {
  roast: RoastResponse | null;
  loading: boolean;
  error: string | null;
  triggerRoast: (request: RoastRequest) => Promise<void>;
  reset: () => void;
}

export function useRoastEngine(): UseRoastEngineReturn {
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRoast = useCallback(async (request: RoastRequest) => {
    setLoading(true);
    setError(null);
    setRoast(null);
    try {
      const { data } = await api.post<RoastResponse>('/roast', request);
      setRoast(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Failed to generate roast';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRoast(null);
    setError(null);
    setLoading(false);
  }, []);

  return { roast, loading, error, triggerRoast, reset };
}

export type { RoastRequest };
