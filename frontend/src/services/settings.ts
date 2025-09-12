import { api } from '../lib/api';
import type { ApiResponse } from '../lib/api';

export type AppSettings = {
  id: string;
  colorScheme: 'classic' | 'modernBlue' | 'warmMinimal';
  margins: { top: number; bottom: number; left: number; right: number };
  createdAt: string;
  updatedAt: string;
};

export const settingsApi = {
  get: async (): Promise<ApiResponse<AppSettings>> => {
    const { data } = await api.get('/api/settings');
    return data;
  },
  update: async (payload: Partial<Pick<AppSettings, 'colorScheme' | 'margins'>>): Promise<ApiResponse<AppSettings>> => {
    const { data } = await api.put('/api/settings', payload);
    return data;
  },
};