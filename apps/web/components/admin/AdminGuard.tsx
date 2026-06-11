'use client';

import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, fetchUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading, fetchUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
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

  return <>{children}</>;
}
