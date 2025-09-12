import { api } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { ProjectAsset } from './types';

// ==================== Assets API ====================

export const assetsApi = {
  // Upload single asset
  upload: async (projectId: string, file: File): Promise<ApiResponse<ProjectAsset>> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post(`/api/assets/upload/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Upload multiple assets
  uploadMultiple: async (
    projectId: string,
    files: File[],
  ): Promise<ApiResponse<{ uploaded: ProjectAsset[]; errors: any[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const { data } = await api.post(`/api/assets/upload-multiple/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Get asset
  getById: async (id: string): Promise<ApiResponse<ProjectAsset>> => {
    const { data } = await api.get(`/api/assets/${id}`);
    return data;
  },

  // Update asset
  update: async (id: string, asset: Partial<ProjectAsset>): Promise<ApiResponse<ProjectAsset>> => {
    const { data } = await api.put(`/api/assets/${id}`, asset);
    return data;
  },

  // Delete asset
  delete: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/assets/${id}`);
    return data;
  },

  // Set hero image
  setHero: async (id: string): Promise<ApiResponse<ProjectAsset>> => {
    const { data } = await api.post(`/api/assets/${id}/set-hero`);
    return data;
  },

  // Reorder assets
  reorder: async (assets: { id: string; displayOrder: number }[]): Promise<ApiResponse> => {
    const { data } = await api.post('/api/assets/reorder', { assets });
    return data;
  },
};