'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const DATA = [
  { name: 'Easy', value: 50, color: '#10b981' },
  { name: 'Medium', value: 35, color: '#f59e0b' },
  { name: 'Hard', value: 15, color: '#ef4444' },
];

export function DifficultyDonut() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
      <div className="w-64 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0D0D14',
                border: '1px solid rgba(108,85,245,0.2)',
                borderRadius: '12px',
                color: '#E8E8FF',
              }}
              formatter={(value) => [`${value ?? 0}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {DATA.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-text-primary font-medium w-16">{item.name}</span>
            <span className="text-text-muted font-mono">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
