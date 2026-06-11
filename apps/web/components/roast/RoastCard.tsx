'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { RoastResponse } from '@roastcoder/shared';
import { Copy, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RoastCardProps {
  roast: RoastResponse | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function LoadingDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{'.'.repeat(dots)}</span>;
}

function RoastContent({ roast }: { roast: RoastResponse }) {
  const [displayedText, setDisplayedText] = useState('');
  const [complete, setComplete] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const isPraise = roast.mood === 'praise';

  useEffect(() => {
    setDisplayedText('');
    setComplete(false);
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length >= roast.roast.length) {
          clearInterval(interval);
          setComplete(true);
          return prev;
        }
        return roast.roast.slice(0, prev.length + 1);
      });
    }, 25);
    return () => clearInterval(interval);
  }, [roast.roast]);

  const handleShare = async () => {
    const text = `I got ${roast.verdict} on RoastCoder! 🤖 '${roast.roast}' roastcoder.dev`;
    await navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roast.roast);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-shadow',
        isPraise
          ? 'border-success/40 glow-success animate-pulse-green'
          : 'border-danger/40 glow-danger animate-pulse-red'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPraise ? (
            <Badge variant="success">✅ Accepted</Badge>
          ) : (
            <Badge variant="danger">{roast.verdict}</Badge>
          )}
          <span className="text-xs text-text-dim">AI Feedback</span>
        </div>
        <span className="text-xl">{isPraise ? '🎉' : '🔥'}</span>
      </div>

      <p
        className={cn(
          'font-mono text-sm leading-[1.6] text-text-primary',
          !complete && 'typewriter-cursor'
        )}
      >
        {displayedText}
      </p>

      <div
        className={cn('mt-4 space-y-4 transition-opacity', complete ? 'opacity-100' : 'opacity-0')}
        style={{ transitionDuration: '400ms' }}
      >
        <div className="border-t border-border pt-4">
          <p className="text-[10px] font-semibold tracking-wider text-text-dim mb-2">EXPLANATION</p>
          <p className="text-sm text-text-muted leading-relaxed">{roast.explanation}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-text-dim mb-2">💡 HINT</p>
          <p className="text-sm text-text-muted leading-relaxed">{roast.hint}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" magnetic={false} className="text-xs py-1 px-3" onClick={handleShare}>
            <Share2 className="h-3 w-3" />
            {shareCopied ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="ghost" magnetic={false} className="text-xs py-1 px-3" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
            {textCopied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RoastCard({ roast, loading, error, onRetry }: RoastCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-accent/40 glow-accent p-5 animate-pulse">
        <p className="text-sm text-text-primary animate-pulse mb-2">AI is judging your code...</p>
        <p className="text-xs text-text-muted">
          Generating roast
          <LoadingDots />
        </p>
        <div className="mt-4 h-16 rounded-lg bg-surface-2 shimmer" />
        <div className="mt-2 h-8 rounded-lg bg-surface-2 shimmer w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-5">
        <p className="text-sm font-medium text-danger mb-1">Roast engine had an error</p>
        <p className="text-xs text-text-muted mb-4">{error}</p>
        {onRetry && (
          <Button variant="danger" magnetic={false} className="text-xs py-1 px-3" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (roast) {
    return <RoastContent roast={roast} />;
  }

  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-3xl mb-3">🤖</p>
      <p className="text-sm text-text-dim">Submit your code to get roasted by AI</p>
    </div>
  );
}
