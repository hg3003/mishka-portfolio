import { api } from '../lib/api';
import type { ApiResponse } from '../lib/api';

// ==================== Stats API ====================

export const statsApi = {
  getStats: async (): Promise<ApiResponse<{
    projects: number;
    assets: number;
    experiences: number;
    education: number;
    skills: number;
    portfolios: number;
    total: number;
  }>> => {
    const { data } = await api.get('/api/stats');
    return data;
  },
};