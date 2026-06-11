'use client';

import { ErrorCard } from '@/components/ErrorCard';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background aurora-bg">
      <ErrorCard
        title="Oops! Something broke"
        message={error.message || 'An unexpected error occurred. Please try again.'}
        onRetry={reset}
        showHome
      />
    </div>
  );
}
