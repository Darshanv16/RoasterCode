'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  className?: string;
}

export function XPBar({ current, max, level, className }: XPBarProps) {
  const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-accent text-xs font-bold text-white shadow-accent-sm">
          {level}
        </span>
        <span className="text-xs text-text-muted">
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-text-muted border border-border">
          {level + 1}
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-3 overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-accent shadow-accent-sm"
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-50"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s linear infinite',
          }}
        />
      </div>
    </div>
  );
}
