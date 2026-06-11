'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { leaderboardApi, type LeaderboardEntry } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Crown, Medal, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type LeaderboardTab = 'xp' | 'problems' | 'streak';

const TABS: { key: LeaderboardTab; label: string; icon: string }[] = [
  { key: 'xp', label: 'XP', icon: '🏆' },
  { key: 'problems', label: 'Problems Solved', icon: '📊' },
  { key: 'streak', label: 'Streak', icon: '🔥' },
];

function getScore(entry: LeaderboardEntry, tab: LeaderboardTab): string {
  if (tab === 'xp') return `${entry.xp.toLocaleString()} XP`;
  if (tab === 'problems') return `${entry.problemsSolved ?? 0} solved`;
  return `${entry.streak ?? 0} day streak`;
}

function PodiumPlace({
  entry,
  place,
  tab,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  tab: LeaderboardTab;
}) {
  const heights = { 1: 'h-36', 2: 'h-28', 3: 'h-24' };
  const avatarSizes = { 1: '!h-16 !w-16', 2: '!h-[52px] !w-[52px]', 3: '!h-[52px] !w-[52px]' };
  const orders = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };
  const borders = {
    1: 'border-yellow-400/60 shadow-[0_0_30px_rgba(250,204,21,0.2)]',
    2: 'border-silver/50',
    3: 'border-bronze/50',
  };
  const medals = {
    1: <Crown className="h-7 w-7 text-gold mx-auto" />,
    2: <Medal className="h-5 w-5 text-silver mx-auto" />,
    3: <Medal className="h-5 w-5 text-bronze mx-auto" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.15 }}
      className={cn('flex flex-col items-center flex-1 max-w-[140px]', orders[place])}
    >
      <div className="mb-2 text-center">
        {medals[place]}
        <Link href={`/profile/${entry.username}`}>
          <Avatar
            name={entry.username}
            src={entry.avatarUrl}
            size="md"
            className={cn('mx-auto mt-2', avatarSizes[place])}
          />
        </Link>
      </div>
      <Link
        href={`/profile/${entry.username}`}
        className="font-bold text-text-primary text-sm truncate max-w-full hover:text-accent"
      >
        {entry.username}
      </Link>
      <p className="text-xs text-text-muted mb-1">{getScore(entry, tab)}</p>
      <Badge variant="accent" className="text-[10px] mb-2">
        Lv.{entry.level ?? 1}
      </Badge>
      <div
        className={cn(
          'w-full rounded-t-xl border-2 flex items-end justify-center pb-3 bg-surface-2',
          heights[place],
          borders[place]
        )}
      >
        <span
          className={cn(
            'text-2xl font-bold',
            place === 1 && 'text-gold',
            place === 2 && 'text-silver',
            place === 3 && 'text-bronze'
          )}
        >
          #{place}
        </span>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const user = useUserStore((s) => s.user);
  const [tab, setTab] = useState<LeaderboardTab>('xp');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [yourEntry, setYourEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    leaderboardApi
      .get({ by: tab, limit: 50 })
      .then(({ data }) => {
        setLeaders(data.leaderboard);
        setYourEntry(data.yourEntry);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const yourInList = leaders.some((l) => l.username === user?.username);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="table-row" />
        ))}
      </div>
    );
  }

  if (leaders.length <= 1) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Trophy className="h-24 w-24 text-gold mx-auto mb-6 animate-pulse-glow" />
        <h1 className="text-3xl font-bold text-gradient-gold mb-3">The arena is empty</h1>
        <p className="text-text-muted mb-8">Be the first to climb the ranks!</p>
        <Link href="/problems">
          <Button>Start Solving →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <Trophy className="h-10 w-10 text-gold mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gradient-gold mb-2">Leaderboard</h1>
        <p className="text-text-muted">Real rankings from registered coders</p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              tab === t.key
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-accent/30'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-10 px-2">
          <PodiumPlace entry={top3[1]} place={2} tab={tab} />
          <PodiumPlace entry={top3[0]} place={1} tab={tab} />
          <PodiumPlace entry={top3[2]} place={3} tab={tab} />
        </div>
      )}

      <Card className="p-0 overflow-hidden" hover={false}>
        <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-text-muted uppercase tracking-wider">
          <span>Rank</span>
          <span>User</span>
          <span>Level</span>
          <span>Score</span>
          <span>Change</span>
        </div>

        {rest.map((leader) => {
          const isYou = user?.username === leader.username;
          return (
            <div
              key={leader.username}
              className={cn(
                'grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-border/50 hover:bg-surface-2/50 transition-colors',
                isYou && 'bg-accent/10'
              )}
            >
              <span className="font-mono text-text-muted">{leader.rank}</span>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={leader.username} src={leader.avatarUrl} size="sm" />
                <Link
                  href={`/profile/${leader.username}`}
                  className="font-medium text-text-primary hover:text-accent truncate"
                >
                  {leader.username}
                  {isYou && <span className="ml-2 text-xs text-accent">(you)</span>}
                </Link>
              </div>
              <Badge variant="default">Lv.{leader.level ?? 1}</Badge>
              <span className="text-sm text-text-muted">{getScore(leader, tab)}</span>
              <span className="text-text-dim text-sm">●</span>
            </div>
          );
        })}

        {yourEntry && !yourInList && (
          <>
            <div className="border-t-2 border-accent/30" />
            <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 items-center px-6 py-4 bg-accent/5 border-l-4 border-l-accent">
              <span className="font-mono text-accent">{yourEntry.rank}</span>
              <div className="flex items-center gap-3">
                <Avatar name={yourEntry.username} src={yourEntry.avatarUrl} size="sm" />
                <span className="font-medium text-text-primary">
                  {yourEntry.username}
                  <span className="ml-2 text-xs text-accent">You</span>
                </span>
              </div>
              <Badge variant="accent">Lv.{yourEntry.level ?? 1}</Badge>
              <span className="text-sm text-text-muted">{getScore(yourEntry, tab)}</span>
              <span className="text-text-dim text-sm">●</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
