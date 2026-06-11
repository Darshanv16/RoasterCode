import { Badge } from '@/components/ui/Badge';

const verdictConfig: Record<string, { variant: 'success' | 'danger' | 'warning' | 'default' | 'pending'; label: string }> = {
  ACCEPTED: { variant: 'success', label: 'Accepted' },
  WRONG_ANSWER: { variant: 'danger', label: 'Wrong Answer' },
  RUNTIME_ERROR: { variant: 'warning', label: 'Runtime Error' },
  COMPILATION_ERROR: { variant: 'warning', label: 'Compile Error' },
  TIME_LIMIT_EXCEEDED: { variant: 'warning', label: 'TLE' },
  MEMORY_LIMIT_EXCEEDED: { variant: 'warning', label: 'MLE' },
  PENDING: { variant: 'pending', label: 'Pending' },
};

export function VerdictBadge({ verdict }: { verdict: string }) {
  const config = verdictConfig[verdict] ?? { variant: 'default' as const, label: verdict };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
