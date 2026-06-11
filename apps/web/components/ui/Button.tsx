'use client';

import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, useRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  magnetic?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-accent text-white shadow-accent hover:shadow-accent hover:brightness-110 border border-accent/30',
  secondary:
    'bg-transparent text-text-primary border border-border hover:border-accent/50 hover:bg-accent/5',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-2 border border-transparent',
  danger: 'bg-danger/20 text-danger border border-danger/40 shadow-danger hover:bg-danger/30',
  success:
    'bg-success/20 text-success border border-success/40 shadow-success hover:bg-success/30',
  gold: 'bg-gradient-gold text-background font-semibold shadow-gold hover:brightness-110',
};

export function Button({
  variant = 'primary',
  loading = false,
  magnetic = true,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.15);
    y.set((e.clientY - cy) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
    >
      <button
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
          'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed',
          'group',
          variants[variant],
          className
        )}
        {...props}
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </span>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
    </motion.div>
  );
}
