'use client';

import { RoastCard } from '@/components/roast/RoastCard';
import type { RoastResponse } from '@roastcoder/shared';
import { useEffect, useRef, useState } from 'react';

export function LandingRoastCard({ roast }: { roast: RoastResponse }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <RoastCard roast={roast} loading={false} error={null} />
      ) : (
        <div className="rounded-xl border border-border bg-surface/50 h-64 shimmer" />
      )}
    </div>
  );
}
