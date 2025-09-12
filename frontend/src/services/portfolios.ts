import { api } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { Portfolio, PortfolioTemplate } from './types';

// ==================== Portfolios API ====================

export const portfoliosApi = {
  // Get all portfolios
  getAll: async (): Promise<ApiResponse<Portfolio[]>> => {
    const { data } = await api.get('/api/portfolios');
    return data;
  },

  // Get single portfolio
  getById: async (id: string): Promise<ApiResponse<Portfolio>> => {
    const { data } = await api.get(`/api/portfolios/${id}`);
    return data;
  },

  // Create portfolio
  create: async (portfolio: {
    portfolioName: string;
    portfolioType: 'SAMPLE' | 'FULL';
    templateId?: string;
    cvIncluded: boolean;
    projects: {
      projectId: string;
      displayOrder: number;
      includedAssets: string[];
    }[];
    settings?: any;
  }): Promise<ApiResponse<Portfolio>> => {
    const { data } = await api.post('/api/portfolios', portfolio);
    return data;
  },

  // Update portfolio
  update: async (id: string, portfolio: Partial<Portfolio>): Promise<ApiResponse<Portfolio>> => {
    const { data } = await api.put(`/api/portfolios/${id}`, portfolio);
    return data;
  },

  // Delete portfolio
  delete: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/portfolios/${id}`);
    return data;
  },

  // Get templates
  getTemplates: async (): Promise<ApiResponse<PortfolioTemplate[]>> => {
    const { data } = await api.get('/api/portfolios/templates');
    return data;
  },

  // Duplicate portfolio
  duplicate: async (id: string): Promise<ApiResponse<Portfolio>> => {
    const { data } = await api.post(`/api/portfolios/${id}/duplicate`);
    return data;
  },

  // Add project to portfolio
  addProject: async (
    portfolioId: string,
    project: {
      projectId: string;
      displayOrder?: number;
      includedAssets?: string[];
    }
  ): Promise<ApiResponse> => {
    const { data } = await api.post(`/api/portfolios/${portfolioId}/add-project`, project);
    return data;
  },

  // Remove project from portfolio
  removeProject: async (portfolioId: string, projectId: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/portfolios/${portfolioId}/remove-project/${projectId}`);
    return data;
  },
  generate: async (
    id: string
  ): Promise<ApiResponse<{ filePath: string; fileSize?: number; totalPages?: number }>> => {
    const { data } = await api.post(`/api/portfolios/${id}/generate`);
    return data;
  },
  getRenderable: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await api.get(`/api/portfolios/${id}/renderable`);
    return data;
  },
};
