'use client';

import { formatDate } from '@/lib/format';
import { useMemo, useState } from 'react';

const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const WEEKS = 52;
const DAYS = 7;

function countColor(count: number): string {
  if (count === 0) return '#0D0D14';
  if (count <= 2) return 'rgba(108, 85, 245, 0.2)';
  if (count <= 5) return 'rgba(108, 85, 245, 0.4)';
  if (count <= 9) return 'rgba(108, 85, 245, 0.6)';
  return '#6C55F5';
}

export function ActivityHeatmap({
  heatmap,
}: {
  heatmap: { date: string; count: number }[];
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { cells, monthLabels } = useMemo(() => {
    const countMap = new Map(heatmap.map((h) => [h.date, h.count]));
    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (WEEKS * DAYS - 1));

    const grid: { date: string; count: number; week: number; day: number }[] = [];
    for (let i = 0; i < WEEKS * DAYS; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const date = d.toISOString().slice(0, 10);
      const day = d.getUTCDay();
      const week = Math.floor(i / 7);
      grid.push({ date, count: countMap.get(date) ?? 0, week, day });
    }

    const months: { label: string; week: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + w * 7);
      const month = d.getUTCMonth();
      if (month !== lastMonth) {
        months.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          week: w,
        });
        lastMonth = month;
      }
    }

    return { cells: grid, monthLabels: months };
  }, [heatmap]);

  const width = WEEKS * STEP;
  const height = DAYS * STEP;

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[676px]">
        <svg width={width + 30} height={height + 20} className="block">
          {monthLabels.map((m) => (
            <text
              key={`${m.label}-${m.week}`}
              x={30 + m.week * STEP}
              y={10}
              className="fill-text-dim text-[10px]"
            >
              {m.label}
            </text>
          ))}
          {['Mon', 'Wed', 'Fri'].map((label, i) => (
            <text
              key={label}
              x={0}
              y={20 + (i * 2 + 1) * STEP + CELL / 2}
              className="fill-text-dim text-[10px]"
            >
              {label}
            </text>
          ))}
          {cells.map((cell) => (
            <rect
              key={cell.date}
              x={30 + cell.week * STEP}
              y={20 + cell.day * STEP}
              width={CELL}
              height={CELL}
              rx={2}
              fill={countColor(cell.count)}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  text: `${cell.count} submission${cell.count !== 1 ? 's' : ''} on ${formatDate(cell.date)}`,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>
        {tooltip && (
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full px-2 py-1 rounded bg-surface-3 border border-border text-xs text-text-primary pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y - 8 }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
