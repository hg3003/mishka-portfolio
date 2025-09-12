import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../services/stats';

// ==================== Stats Hook ====================

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}