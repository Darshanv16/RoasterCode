'use client';

import { DifficultyBadge } from '@/components/problems/DifficultyBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  formatCountdown,
  getDayOfYear,
  getMsUntilMidnightUtc,
} from '@/lib/format';
import { problemsApi, type ProblemListItem } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Code2, RotateCcw, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 20;

type SortOption = 'newest' | 'oldest' | 'hardest' | 'easiest' | 'attempts';
type StatusFilter = 'all' | 'solved' | 'attempted' | 'unsolved';

const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };

function StatusIcon({ status }: { status?: string }) {
  if (status === 'solved') return <span className="text-success">✅</span>;
  if (status === 'attempted') return <span className="text-warning">🔄</span>;
  return <span className="text-text-dim">—</span>;
}

export function ProblemsPageClient({
  initialProblems,
}: {
  initialProblems: ProblemListItem[];
}) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const [problems, setProblems] = useState<ProblemListItem[]>(initialProblems);
  const [loading, setLoading] = useState(false);
  const [difficulties, setDifficulties] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tagSearch, setTagSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [countdown, setCountdown] = useState(getMsUntilMidnightUtc());

  const refreshProblems = useCallback(() => {
    setLoading(true);
    problemsApi
      .list({ limit: 100 })
      .then(({ data }) => setProblems(data.problems))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshProblems();
  }, [isAuthenticated, refreshProblems]);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getMsUntilMidnightUtc()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyChallenge = useMemo(() => {
    if (problems.length === 0) return null;
    const idx = getDayOfYear() % problems.length;
    return problems[idx];
  }, [problems]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of problems) {
      for (const tag of p.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return counts;
  }, [problems]);

  const difficultyCounts = useMemo(() => {
    const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const p of problems) counts[p.difficulty]++;
    return counts;
  }, [problems]);

  const filtered = useMemo(() => {
    let result = [...problems];

    if (difficulties.size > 0) {
      result = result.filter((p) => difficulties.has(p.difficulty));
    }

    if (selectedTags.size > 0) {
      result = result.filter((p) =>
        Array.from(selectedTags).every((tag) => p.tags.includes(tag))
      );
    }

    if (isAuthenticated && statusFilter !== 'all') {
      result = result.filter((p) => {
        if (statusFilter === 'solved') return p.solveStatus === 'solved';
        if (statusFilter === 'attempted') return p.solveStatus === 'attempted';
        return !p.solveStatus || p.solveStatus === 'unsolved';
      });
    }

    switch (sort) {
      case 'oldest':
        result.reverse();
        break;
      case 'hardest':
        result.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
        break;
      case 'easiest':
        result.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'attempts':
        result.sort((a, b) => (b.totalAttempts ?? 0) - (a.totalAttempts ?? 0));
        break;
    }

    return result;
  }, [problems, difficulties, selectedTags, statusFilter, sort, isAuthenticated]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters =
    difficulties.size > 0 || selectedTags.size > 0 || statusFilter !== 'all';

  const resetFilters = () => {
    setDifficulties(new Set());
    setSelectedTags(new Set());
    setTagSearch('');
    setStatusFilter('all');
    setSort('newest');
    setPage(1);
  };

  const toggleDifficulty = (d: string) => {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setPage(1);
  };

  const filteredTags = Array.from(tagCounts.entries())
    .filter(([tag]) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="h-6 w-6 text-accent" />
          <h1 className="text-3xl font-bold text-text-primary">Problems</h1>
        </div>
        <p className="text-text-muted">{problems.length} coding challenges</p>
      </motion.div>

      {dailyChallenge && (
        <Card featured className="mb-8 p-5 border-accent/40 bg-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">
                  Daily Challenge
                </span>
                <Badge variant="gold">2x XP today</Badge>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-text-primary">{dailyChallenge.title}</h2>
                <DifficultyBadge difficulty={dailyChallenge.difficulty} />
              </div>
              <p className="text-sm text-text-muted mt-1 font-mono">
                Resets in {formatCountdown(countdown)} UTC
              </p>
            </div>
            <Link href={`/problems/${dailyChallenge.slug}`}>
              <Button>Solve Now →</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Difficulty</p>
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <label key={d} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={difficulties.has(d)}
                    onChange={() => toggleDifficulty(d)}
                    className="rounded border-border accent-accent"
                  />
                  <span className="text-sm text-text-primary group-hover:text-accent">
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </span>
                  <span
                    className={cn(
                      'ml-auto text-xs font-mono',
                      d === 'EASY' && 'text-success',
                      d === 'MEDIUM' && 'text-warning',
                      d === 'HARD' && 'text-danger'
                    )}
                  >
                    {difficultyCounts[d]}
                  </span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Tags</p>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim" />
                <input
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent/50"
                />
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {filteredTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors',
                      selectedTags.has(tag)
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-muted hover:bg-surface-2'
                    )}
                  >
                    {tag}
                    <span className="text-text-dim">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {isAuthenticated && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Status</p>
                {(
                  [
                    ['all', 'All Problems'],
                    ['solved', 'Solved ✅'],
                    ['attempted', 'Attempted 🔄'],
                    ['unsolved', 'Not Started'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={statusFilter === value}
                      onChange={() => {
                        setStatusFilter(value);
                        setPage(1);
                      }}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text-primary">{label}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Sort</p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="hardest">Hardest</option>
                <option value="easiest">Easiest</option>
                <option value="attempts">Most Attempted</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden p-0" hover={false}>
            <div
              className={cn(
                'grid gap-4 px-6 py-3 border-b border-border text-xs font-medium text-text-muted uppercase tracking-wider',
                isAuthenticated
                  ? 'grid-cols-[2rem_1fr_auto_auto_auto_auto_auto]'
                  : 'grid-cols-[2rem_1fr_auto_auto_auto_auto]'
              )}
            >
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span className="hidden sm:block">Tags</span>
              <span>Acceptance</span>
              {isAuthenticated && <span>Status</span>}
              <span>XP</span>
            </div>

            {loading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <Skeleton variant="table-row" />
                </div>
              ))}

            {!loading && paginated.length === 0 && (
              <div className="px-6 py-12 text-center text-text-muted">
                No problems match your filters.
              </div>
            )}

            {!loading &&
              paginated.map((problem, i) => (
                <Link key={problem.id} href={`/problems/${problem.slug}`}>
                  <div
                    className={cn(
                      'grid gap-4 items-center px-6 py-4 border-b border-border/50 hover:bg-surface-2 transition-colors cursor-pointer group',
                      isAuthenticated
                        ? 'grid-cols-[2rem_1fr_auto_auto_auto_auto_auto]'
                        : 'grid-cols-[2rem_1fr_auto_auto_auto_auto]'
                    )}
                  >
                    <span className="font-mono text-sm text-text-dim">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </span>
                    <span className="text-text-primary font-medium group-hover:text-accent transition-colors truncate">
                      {problem.title}
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <div className="hidden sm:flex gap-1 flex-wrap">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default" className="text-[10px] py-0">
                          {tag}
                        </Badge>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="text-xs text-text-dim">+{problem.tags.length - 3}</span>
                      )}
                    </div>
                    <span className="text-text-muted text-sm font-mono">
                      {problem.acceptanceRate != null
                        ? `${problem.acceptanceRate.toFixed(1)}%`
                        : '—'}
                    </span>
                    {isAuthenticated && (
                      <StatusIcon status={problem.solveStatus} />
                    )}
                    <span className="text-accent font-mono text-sm">⚡ {problem.xpReward}</span>
                  </div>
                </Link>
              ))}
          </Card>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
              <p>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} problems
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  magnetic={false}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="py-1 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-mono text-text-primary">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  magnetic={false}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="py-1 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
