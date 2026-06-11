'use client';

import { AchievementsGrid } from '@/components/profile/AchievementCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersApi, type AchievementWithStatus } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const RARITY_TABS = ['All', 'Legendary', 'Epic', 'Rare', 'Common'] as const;
type RarityTab = (typeof RARITY_TABS)[number];

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUserStore();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RarityTab>('All');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    usersApi
      .getMyAchievements()
      .then(({ data }) => setAchievements(data.achievements))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  const filtered = useMemo(() => {
    if (tab === 'All') return achievements;
    return achievements.filter((a) => a.rarity === tab.toUpperCase());
  }, [achievements, tab]);

  if (isLoading || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton variant="card" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-6 w-6 text-gold" />
          <h1 className="text-3xl font-bold text-text-primary">Achievements</h1>
        </div>
        <p className="text-text-muted mb-6">Unlock badges by solving problems and hitting milestones</p>

        <Card className="mb-6" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Progress</span>
            <span className="text-sm font-mono text-accent">
              {unlocked} / {achievements.length} unlocked
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-3 overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-accent rounded-full transition-all duration-700"
              style={{
                width: achievements.length
                  ? `${(unlocked / achievements.length) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </Card>

        <div className="flex gap-2 mb-6 flex-wrap">
          {RARITY_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                tab === t
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:border-accent/30'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <AchievementsGrid achievements={filtered} />
      </motion.div>
    </div>
  );
}
