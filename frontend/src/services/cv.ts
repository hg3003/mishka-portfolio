import { api } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type {
  PersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
  CVData,
} from './types';
import {
  sanitizePersonalInfoPayload,
  sanitizeEducationPayload,
  sanitizeExperiencePayload,
} from './sanitizers';

// ==================== CV API ====================

export const cvApi = {
  // Get all CV data
  getAll: async (): Promise<ApiResponse<CVData>> => {
    const { data } = await api.get('/api/cv/all');
    return data;
  },

  // Personal Info
  getPersonalInfo: async (): Promise<ApiResponse<PersonalInfo>> => {
    const { data } = await api.get('/api/cv/personal-info');
    return data;
  },

  updatePersonalInfo: async (info: Partial<PersonalInfo>): Promise<ApiResponse<PersonalInfo>> => {
    const payload = sanitizePersonalInfoPayload(info);
    const { data } = await api.put('/api/cv/personal-info', payload);
    return data;
  },

  // Experience
  getExperiences: async (): Promise<ApiResponse<CVExperience[]>> => {
    const { data } = await api.get('/api/cv/experience');
    return data;
  },

  createExperience: async (experience: Partial<CVExperience>): Promise<ApiResponse<CVExperience>> => {
    const payload = sanitizeExperiencePayload(experience);
    const { data } = await api.post('/api/cv/experience', payload);
    return data;
  },

  updateExperience: async (id: string, experience: Partial<CVExperience>): Promise<ApiResponse<CVExperience>> => {
    const payload = sanitizeExperiencePayload(experience);
    const { data } = await api.put(`/api/cv/experience/${id}`, payload);
    return data;
  },

  deleteExperience: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/cv/experience/${id}`);
    return data;
  },

  // Education
  getEducation: async (): Promise<ApiResponse<CVEducation[]>> => {
    const { data } = await api.get('/api/cv/education');
    return data;
  },

  createEducation: async (education: Partial<CVEducation>): Promise<ApiResponse<CVEducation>> => {
    const payload = sanitizeEducationPayload(education);
    const { data } = await api.post('/api/cv/education', payload);
    return data;
  },

  updateEducation: async (id: string, education: Partial<CVEducation>): Promise<ApiResponse<CVEducation>> => {
    const payload = sanitizeEducationPayload(education);
    const { data } = await api.put(`/api/cv/education/${id}`, payload);
    return data;
  },

  deleteEducation: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/cv/education/${id}`);
    return data;
  },

  // Skills
  getSkills: async (): Promise<ApiResponse<CVSkill[]>> => {
    const { data } = await api.get('/api/cv/skills');
    return data;
  },

  createSkill: async (skill: Partial<CVSkill>): Promise<ApiResponse<CVSkill>> => {
    const { data } = await api.post('/api/cv/skills', skill);
    return data;
  },

  updateSkill: async (id: string, skill: Partial<CVSkill>): Promise<ApiResponse<CVSkill>> => {
    const { data } = await api.put(`/api/cv/skills/${id}`, skill);
    return data;
  },

  deleteSkill: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete(`/api/cv/skills/${id}`);
    return data;
  },

  // Generate standalone CV PDF via Playwright
  generate: async (): Promise<ApiResponse<{ filePath: string; fileSize?: number }>> => {
    const { data } = await api.post('/api/cv/generate');
    return data;
  },
};