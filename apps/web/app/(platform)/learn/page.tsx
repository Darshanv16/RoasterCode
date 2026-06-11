'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { learningApi, type LearningChapter } from '@/lib/api';
import { getPetStage } from '@/lib/petSystem';
import { cn } from '@/lib/utils';
import { usePetStore } from '@/stores/petStore';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Map } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const difficultyVariant = {
  EASY: 'success' as const,
  MEDIUM: 'warning' as const,
  HARD: 'danger' as const,
};

const chapterColors = ['#10B981', '#F59E0B', '#8B5CF6', '#3B82F6', '#FFD700'];

function ChapterCard({ chapter, index }: { chapter: LearningChapter; index: number }) {
  const isLocked = chapter.status === 'locked';
  const isCompleted = chapter.status === 'completed';
  const isInProgress = chapter.status === 'in_progress' || chapter.status === 'available';
  const color = chapterColors[index] ?? '#6C55F5';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-bold text-lg',
            isCompleted && 'border-success bg-success/20 text-success shadow-glow-success',
            isInProgress && !isCompleted && 'border-accent bg-accent/20 text-accent animate-pulse-glow',
            isLocked && 'border-border bg-surface-2 text-text-dim'
          )}
          style={isInProgress && !isCompleted ? { borderColor: color } : undefined}
        >
          {isLocked ? <Lock className="h-5 w-5" /> : chapter.id}
        </div>
        {index < 4 && (
          <div
            className={cn(
              'w-0.5 flex-1 min-h-[40px] mt-2',
              isCompleted ? 'bg-success' : isLocked ? 'border-l-2 border-dashed border-border' : 'bg-accent/50'
            )}
          />
        )}
      </div>

      <Card
        className={cn(
          'flex-1 mb-6 p-5 transition-all',
          isLocked && 'opacity-60',
          isCompleted && 'border-success/50 shadow-glow-success',
          isInProgress && !isCompleted && 'border-accent/50 shadow-accent-sm'
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-text-primary">{chapter.name}</h3>
              {isCompleted && (
                <span className="text-2xl" title={chapter.badgeLabel}>
                  {chapter.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">{chapter.description}</p>
          </div>
          <div className="text-right shrink-0">
            {isCompleted && (
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Completed!
              </div>
            )}
            {isLocked && (
              <p className="text-xs text-text-dim">Complete previous chapter to unlock</p>
            )}
            {isInProgress && !isCompleted && (
              <p className="text-xs text-accent font-medium">
                {chapter.solvedCount}/{chapter.problemCount} solved
              </p>
            )}
            {isCompleted && (
              <p className="text-xs text-gold mt-1">+{chapter.creditsEarned} credits earned</p>
            )}
          </div>
        </div>

        {!isLocked && isInProgress && !isCompleted && (
          <div className="mb-4">
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${(chapter.solvedCount / chapter.problemCount) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}

        <div className={cn('space-y-2', isLocked && 'blur-sm pointer-events-none select-none')}>
          {chapter.problems.map((problem) => (
            <Link
              key={problem.slug}
              href={`/problems/${problem.slug}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors group"
            >
              <span className="text-sm w-5">
                {problem.solved ? '✅' : '○'}
              </span>
              <span className="flex-1 text-sm text-text-primary group-hover:text-accent transition-colors">
                {problem.title}
              </span>
              <Badge variant={difficultyVariant[problem.difficulty]}>{problem.difficulty}</Badge>
              <span className="text-xs text-text-dim">+{problem.xpReward} XP</span>
            </Link>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function LearnPage() {
  const user = useUserStore((s) => s.user);
  const { stage } = usePetStore();
  const [chapters, setChapters] = useState<LearningChapter[]>([]);
  const [progress, setProgress] = useState({ solved: 0, total: 10, percent: 0 });
  const [loading, setLoading] = useState(true);

  const problemsSolved = user?.problemsSolved ?? 0;
  const petStage = getPetStage(problemsSolved);

  useEffect(() => {
    learningApi
      .getPath()
      .then(({ data }) => {
        setChapters(data.chapters);
        setProgress(data.overallProgress);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Map className="h-7 w-7 text-accent" />
          <h1 className="text-3xl font-bold text-gradient">Your Learning Journey</h1>
        </div>

        <div className="mt-4 mb-2">
          <div className="flex justify-between text-sm text-text-muted mb-2">
            <span>
              {progress.solved}/{progress.total} problems completed
            </span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500"
            />
          </div>
        </div>

        <p className="text-sm text-text-muted mt-3">
          Your pet is at Stage {stage} ({petStage.name}) — keep going!
        </p>
      </motion.div>

      <div className="space-y-0">
        {chapters.map((chapter, i) => (
          <ChapterCard key={chapter.id} chapter={chapter} index={i} />
        ))}
      </div>

      {progress.solved === 0 && (
        <div className="text-center mt-8">
          <Link href="/problems/binary-search">
            <Button>Start Chapter 1 →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
