import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { RoastResponse, SubmissionResult, Verdict } from '@roastcoder/shared';

export interface SubmissionDetail extends SubmissionResult {
  code: string;
  language: string;
  xpEarned: number;
  roastGenerated: boolean;
  createdAt: string;
  roast: RoastResponse | null;
}

const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 40;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useSubmission(problemId: string) {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [result, setResult] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollUntilDone = useCallback(async (id: string): Promise<SubmissionDetail> => {
    setIsPolling(true);
    setError(null);
    try {
      for (let i = 0; i < MAX_POLLS; i++) {
        const { data } = await api.get<SubmissionDetail>(`/submissions/${id}`);
        setVerdict(data.verdict);
        if (data.verdict !== 'PENDING') {
          setResult(data);
          return data;
        }
        await sleep(POLL_INTERVAL_MS);
      }
      throw new Error('Submission timed out after 60 seconds');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to poll submission';
      setError(message);
      throw err;
    } finally {
      setIsPolling(false);
    }
  }, []);

  const submit = useCallback(
    async (code: string, language: string): Promise<string> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const { data } = await api.post<{ submissionId: string }>('/submissions', {
          problemId,
          code,
          language,
        });
        setSubmissionId(data.submissionId);
        return data.submissionId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [problemId]
  );

  return {
    submit,
    pollUntilDone,
    submissionId,
    verdict,
    isSubmitting,
    isPolling,
    result,
    error,
  };
}
