import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/users/${username}`).then((r) => r.data),
    enabled: !!username,
  });
}
