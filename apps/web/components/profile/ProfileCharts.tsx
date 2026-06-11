'use client';

import type { UserStats } from '@/lib/api';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const VERDICT_COLORS: Record<string, string> = {
  ACCEPTED: '#10B981',
  WRONG_ANSWER: '#F43F5E',
  RUNTIME_ERROR: '#F59E0B',
  COMPILATION_ERROR: '#3B82F6',
  TIME_LIMIT_EXCEEDED: '#F59E0B',
  MEMORY_LIMIT_EXCEEDED: '#F59E0B',
  PENDING: '#6060A0',
};

const VERDICT_LABELS: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compile Error',
  TIME_LIMIT_EXCEEDED: 'TLE',
  MEMORY_LIMIT_EXCEEDED: 'MLE',
  PENDING: 'Pending',
};

export function ProfileCharts({
  stats,
  easyCount,
  mediumCount,
  hardCount,
}: {
  stats: UserStats;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}) {
  const verdictData = Object.entries(stats.verdictCounts)
    .filter(([verdict, count]) => count > 0 && verdict !== 'PENDING')
    .map(([verdict, count]) => ({
      name: VERDICT_LABELS[verdict] ?? verdict,
      value: count,
      color: VERDICT_COLORS[verdict] ?? '#6060A0',
    }))
    .filter((d) => d.value > 0);

  const totalSubmissions = verdictData.reduce((s, d) => s + d.value, 0);

  const difficultyData = [
    { name: 'Easy', solved: easyCount, fill: '#10B981' },
    { name: 'Medium', solved: mediumCount, fill: '#F59E0B' },
    { name: 'Hard', solved: hardCount, fill: '#F43F5E' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-surface/80 p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Submission Verdicts</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={verdictData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {verdictData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#141420',
                border: '1px solid #1E1E30',
                borderRadius: '8px',
                color: '#E8E8FF',
              }}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-text-primary text-lg font-bold"
            >
              {totalSubmissions}
            </text>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {verdictData.map((d) => (
            <span key={d.name} className="flex items-center gap-1 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/80 p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Problems by Difficulty</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={difficultyData}>
            <Tooltip
              cursor={{ fill: 'rgba(108, 85, 245, 0.1)' }}
              contentStyle={{
                background: '#141420',
                border: '1px solid #6C55F5',
                borderRadius: '8px',
                color: '#E8E8FF',
              }}
            />
            <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
              {difficultyData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
