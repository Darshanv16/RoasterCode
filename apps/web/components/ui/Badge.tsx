import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'warning' | 'gold' | 'pending';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pulse?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-text-muted border-border',
  accent: 'bg-accent/10 text-accent border-accent/30 shadow-accent-sm',
  success: 'bg-success/10 text-success border-success/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  gold: 'bg-gradient-gold text-background border-gold/50 shadow-gold font-semibold',
  pending: 'bg-surface-2 text-text-muted border-border animate-pulse',
};

export function Badge({ children, variant = 'default', className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        pulse && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </span>
  );
}
