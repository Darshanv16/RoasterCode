import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'table-row';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  lines?: number;
}

export function Skeleton({ variant = 'text', className, lines = 1 }: SkeletonProps) {
  if (variant === 'avatar') {
    return <div className={cn('h-10 w-10 rounded-full shimmer bg-surface-2', className)} />;
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border border-border bg-surface shimmer h-32', className)} />
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={cn('flex items-center gap-4 py-4 border-b border-border', className)}>
        <div className="h-4 w-8 rounded shimmer bg-surface-2" />
        <div className="h-4 flex-1 rounded shimmer bg-surface-2" />
        <div className="h-4 w-20 rounded shimmer bg-surface-2" />
        <div className="h-4 w-16 rounded shimmer bg-surface-2" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded shimmer bg-surface-2"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
