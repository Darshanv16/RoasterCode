import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProblem(slug: string) {
  return useQuery({
    queryKey: ['problem', slug],
    queryFn: () => api.get(`/problems/${slug}`).then((r) => r.data),
    staleTime: 300000,
    enabled: !!slug,
  });
}
