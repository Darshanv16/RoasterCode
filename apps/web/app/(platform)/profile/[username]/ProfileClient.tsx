'use client';

import { AchievementsGrid } from '@/components/profile/AchievementCard';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileCharts } from '@/components/profile/ProfileCharts';
import { VerdictBadge } from '@/components/profile/VerdictBadge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { XPBar } from '@/components/ui/XPBar';
import { timeAgo } from '@/lib/format';
import { getXpProgress } from '@/lib/xp';
import {
  submissionsApi,
  usersApi,
  type AchievementWithStatus,
  type SubmissionListItem,
  type UserProfile,
  type UserStats,
} from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { Flame, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function ProfileClient({ profile }: { profile: UserProfile }) {
  const currentUser = useUserStore((s) => s.user);
  const isOwnProfile = currentUser?.username === profile.username;

  const [editOpen, setEditOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(isOwnProfile);

  const xpProgress = getXpProgress(profile.xp, profile.level);

  useEffect(() => {
    if (!isOwnProfile) return;

    Promise.all([
      usersApi.getMyStats(),
      usersApi.getMyAchievements(),
      submissionsApi.getMine(),
    ])
      .then(([statsRes, achievementsRes, subsRes]) => {
        setStats(statsRes.data);
        setAchievements(achievementsRes.data.achievements);
        setSubmissions(subsRes.data.submissions.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoadingExtras(false));
  }, [isOwnProfile]);

  const displaySubmissions = isOwnProfile
    ? submissions
    : profile.recentAccepted.map((s) => ({
        id: s.id,
        problemTitle: s.problemTitle,
        verdict: 'ACCEPTED',
        language: s.language,
        runtime: s.runtime,
        createdAt: s.createdAt,
      }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6">
          <div className="flex items-start gap-6">
            <Avatar
              name={profile.username}
              src={profile.avatarUrl}
              size="lg"
              className="!h-20 !w-20 !text-2xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-mono font-bold text-text-primary mb-1">
                    {profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-text-muted text-sm mb-3 max-w-lg">{profile.bio}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant="accent">Level {profile.level}</Badge>
                    {(profile.streak ?? 0) > 0 && (
                      <Badge variant="warning">
                        <Flame className="h-3 w-3" /> {profile.streak}
                      </Badge>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    magnetic={false}
                    onClick={() => setEditOpen(true)}
                    className="shrink-0"
                  >
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
              <div className="mt-4">
                <XPBar
                  current={xpProgress.current}
                  max={xpProgress.max}
                  level={profile.level}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Problems Solved', value: profile.problemsSolved },
            { label: 'Total Submissions', value: profile.totalSubmissions },
            { label: 'Current Streak 🔥', value: profile.streak },
            { label: 'Max Streak', value: profile.maxStreak },
          ].map((stat) => (
            <Card key={stat.label} hover={false} className="text-center py-5">
              <p className="text-2xl font-bold text-text-primary mb-1">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </Card>
          ))}
        </div>

        {isOwnProfile && (
          <>
            {loadingExtras ? (
              <Card className="mb-6">
                <Skeleton variant="card" />
              </Card>
            ) : stats ? (
              <Card className="mb-6">
                <h2 className="font-semibold text-text-primary mb-4">Activity</h2>
                <ActivityHeatmap heatmap={stats.heatmap} />
              </Card>
            ) : null}

            {stats && (
              <div className="mb-6">
                <ProfileCharts
                  stats={stats}
                  easyCount={profile.easyCount}
                  mediumCount={profile.mediumCount}
                  hardCount={profile.hardCount}
                />
              </div>
            )}

            {!loadingExtras && achievements.length > 0 && (
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">Achievements</h2>
                  <Link href="/achievements" className="text-sm text-accent hover:underline">
                    View all →
                  </Link>
                </div>
                <AchievementsGrid achievements={achievements.slice(0, 8)} />
              </Card>
            )}
          </>
        )}

        <Card hover={false}>
          <h2 className="font-semibold text-text-primary mb-4">Recent Submissions</h2>
          {displaySubmissions.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No submissions yet.</p>
          ) : (
            <div className="space-y-0">
              {displaySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0 text-sm"
                >
                  <VerdictBadge verdict={sub.verdict} />
                  <span className="flex-1 text-text-primary truncate">{sub.problemTitle}</span>
                  <span className="text-text-muted hidden sm:block">{sub.language}</span>
                  <span className="text-text-dim font-mono hidden md:block">
                    {sub.runtime != null ? `${sub.runtime}ms` : '—'}
                  </span>
                  <span className="text-text-dim text-xs">{timeAgo(sub.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          onOpenChange={setEditOpen}
          bio={profile.bio ?? ''}
          avatarUrl={profile.avatarUrl ?? ''}
          onSaved={() => window.location.reload()}
        />
      )}
    </div>
  );
}
