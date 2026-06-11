import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';
import type { AchievementWithStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

const rarityVariant = {
  LEGENDARY: 'gold' as const,
  EPIC: 'accent' as const,
  RARE: 'warning' as const,
  COMMON: 'default' as const,
};

export function AchievementCard({ achievement }: { achievement: AchievementWithStatus }) {
  const isMystery =
    !achievement.unlocked &&
    (achievement.rarity === 'LEGENDARY' || achievement.rarity === 'EPIC');

  const title = isMystery ? '???' : achievement.title;

  return (
    <Card
      hover={false}
      className={cn(
        'p-4 text-center',
        achievement.unlocked
          ? 'border-success/30 bg-success/5'
          : 'border-border opacity-60 grayscale'
      )}
    >
      <div className="text-4xl mb-2">{achievement.icon}</div>
      <p className="font-medium text-text-primary mb-1">{title}</p>
      <p className="text-sm text-text-muted mb-3 line-clamp-2">
        {isMystery ? 'Complete the challenge to reveal' : achievement.description}
      </p>
      <Badge
        variant={rarityVariant[achievement.rarity]}
        className={cn(
          achievement.rarity === 'LEGENDARY' && achievement.unlocked && 'animate-pulse-glow'
        )}
      >
        {achievement.rarity}
      </Badge>
      <p className="text-xs mt-2">
        {achievement.unlocked ? (
          <span className="text-success">Unlocked {formatDate(achievement.unlockedAt!)}</span>
        ) : (
          <span className="text-text-dim">Locked</span>
        )}
      </p>
    </Card>
  );
}

export function AchievementsGrid({ achievements }: { achievements: AchievementWithStatus[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((a) => (
        <AchievementCard key={a.id} achievement={a} />
      ))}
    </div>
  );
}
