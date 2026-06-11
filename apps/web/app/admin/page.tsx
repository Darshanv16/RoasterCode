'use client';

import { DifficultyBadge } from '@/components/problems/DifficultyBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi, problemsApi, type AdminProblem, type AdminStats } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BarChart3, Code2, Plus, Shield, Trash2, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    Promise.all([adminApi.getStats(), adminApi.getProblems()])
      .then(([statsRes, problemsRes]) => {
        setStats(statsRes.data);
        setProblems(problemsRes.data.problems);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      await adminApi.togglePublish(id);
      load();
      toast.success('Publish status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle publish');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this problem? This cannot be undone.')) return;
    try {
      await problemsApi.delete(id);
      toast.success('Problem deleted');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { icon: Users, label: 'Total Users', value: stats.totalUsers, trend: '+12%' },
        { icon: Code2, label: 'Total Problems', value: stats.totalProblems, trend: '+2' },
        { icon: BarChart3, label: 'Submissions Today', value: stats.submissionsToday, trend: '+8%' },
        { icon: TrendingUp, label: 'Acceptance Rate', value: `${stats.acceptanceRate}%`, trend: 'stable' },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-accent" />
            <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
            <Badge variant="accent">ADMIN</Badge>
          </div>
          <Link href="/admin/problems/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Problem
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hover={false} className="flex items-center gap-4">
              <div className="rounded-xl bg-accent/10 p-3">
                <stat.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-xs text-success">{stat.trend}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden" hover={false}>
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-text-muted uppercase tracking-wider">
          <span>Title</span>
          <span>Difficulty</span>
          <span>Status</span>
          <span>Attempts</span>
          <span>Acceptance</span>
          <span>Actions</span>
        </div>
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-border/50 hover:bg-surface-2/50"
          >
            <span className="text-text-primary font-medium truncate">{problem.title}</span>
            <DifficultyBadge difficulty={problem.difficulty} />
            <button
              onClick={() => handleTogglePublish(problem.id)}
              className={cn(
                'relative w-10 h-5 rounded-full transition-colors',
                problem.isPublished ? 'bg-success' : 'bg-surface-3'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                  problem.isPublished ? 'left-5' : 'left-0.5'
                )}
              />
            </button>
            <span className="text-sm text-text-muted font-mono">{problem.totalAttempts}</span>
            <span className="text-sm text-text-muted font-mono">{problem.acceptanceRate}%</span>
            <div className="flex items-center gap-2">
              <Link href={`/admin/problems/${problem.id}/edit`}>
                <Button variant="ghost" magnetic={false} className="text-xs py-1 px-2">
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                magnetic={false}
                className="text-xs py-1 px-2"
                onClick={() => handleDelete(problem.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
