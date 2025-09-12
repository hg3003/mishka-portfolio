import { api } from '../lib/api';
import type { ApiResponse, PaginatedResponse } from '../lib/api';
import type { Project, ProjectAsset } from './types';

// ==================== Projects API ====================

export const projectsApi = {
  // Get all projects with optional filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    projectType?: string;
    search?: string;
    isAcademic?: boolean;
    isCompetition?: boolean;
  }): Promise<PaginatedResponse<Project>> => {
    const { data } = await api.get('/api/projects', { params });
    return data;
  },

  // Get single project
  getById: async (id: string): Promise<ApiResponse<Project>> => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data;
  },

  // Create project
  create: async (project: Partial<Project>): Promise<ApiResponse<Project>> => {
    const { data } = await api.post('/api/projects', project);
    return data;
  },

  // Update project
  update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    // Remove null values - only send defined values
    const cleanedProject = Object.entries(project).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key as keyof Project] = value;
      }
      return acc;
    }, {} as Partial<Project>);
    
    const { data } = await api.put(`/api/projects/${id}`, cleanedProject);
    return data;
  },

  // Delete project
  delete: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/projects/${id}`);
    return data;
  },

  // Get project assets
  getAssets: async (projectId: string): Promise<ApiResponse<ProjectAsset[]>> => {
    const { data } = await api.get(`/api/projects/${projectId}/assets`);
    return data;
  },
};