'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type OrbColor = 'accent' | 'success' | 'danger';

const colors: Record<OrbColor, string> = {
  accent: 'bg-accent/30 shadow-accent',
  success: 'bg-success/30 shadow-success',
  danger: 'bg-danger/30 shadow-danger',
};

interface GlowingOrbProps {
  color?: OrbColor;
  size?: number;
  className?: string;
  delay?: number;
}

export function GlowingOrb({ color = 'accent', size = 300, className, delay = 0 }: GlowingOrbProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      className={cn('absolute rounded-full blur-3xl pointer-events-none', colors[color], className)}
      style={{ width: size, height: size }}
    />
  );
}
