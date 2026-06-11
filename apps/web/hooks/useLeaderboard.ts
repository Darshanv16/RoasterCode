import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useLeaderboard(by: 'xp' | 'problems' | 'streak') {
  return useQuery({
    queryKey: ['leaderboard', by],
    queryFn: () => api.get('/leaderboard', { params: { by } }).then((r) => r.data),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
