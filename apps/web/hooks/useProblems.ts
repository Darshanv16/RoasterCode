import { useQuery } from '@tanstack/react-query';
import { api, type ProblemFilters } from '@/lib/api';

export function useProblems(filters: ProblemFilters) {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: () => api.get('/problems', { params: filters }).then((r) => r.data),
    staleTime: 60000,
  });
}
