import { Badge } from '@/components/ui/Badge';

const difficultyVariant = {
  EASY: 'success' as const,
  MEDIUM: 'warning' as const,
  HARD: 'danger' as const,
};

const difficultyLabel = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}) {
  return (
    <Badge variant={difficultyVariant[difficulty]}>
      {difficultyLabel[difficulty]}
    </Badge>
  );
}
