'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, featured = false, hover = true, onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative rounded-xl bg-surface/80 backdrop-blur-xl border border-border p-6',
        'shadow-card transition-shadow duration-300',
        hover && 'hover:shadow-card-hover hover:border-border-bright cursor-default',
        featured && 'border-accent/30 shadow-accent-sm',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {featured && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/5 to-accent-2/5 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
