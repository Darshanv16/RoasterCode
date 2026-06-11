'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function ErrorCard({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showHome = false,
}: ErrorCardProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center" hover={false}>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-danger/10 p-3 border border-danger/30">
            <AlertTriangle className="h-8 w-8 text-danger" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-muted mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Link href="/">
              <Button variant="ghost">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
