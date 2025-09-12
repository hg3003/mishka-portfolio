import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cvApi } from '../services/cv';
import type {
  PersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
} from '../services/types';

// ==================== CV Hooks ====================

export function useCVData() {
  return useQuery({
    queryKey: ['cv', 'all'],
    queryFn: cvApi.getAll,
  });
}

export function usePersonalInfo() {
  return useQuery({
    queryKey: ['cv', 'personal-info'],
    queryFn: cvApi.getPersonalInfo,
  });
}

export function useUpdatePersonalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: Partial<PersonalInfo>) => cvApi.updatePersonalInfo(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: ['cv', 'experiences'],
    queryFn: cvApi.getExperiences,
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experience: Partial<CVExperience>) => cvApi.createExperience(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, experience }: { id: string; experience: Partial<CVExperience> }) =>
      cvApi.updateExperience(id, experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useEducation() {
  return useQuery({
    queryKey: ['cv', 'education'],
    queryFn: cvApi.getEducation,
  });
}

export function useCreateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (education: Partial<CVEducation>) => cvApi.createEducation(education),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, education }: { id: string; education: Partial<CVEducation> }) =>
      cvApi.updateEducation(id, education),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvApi.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ['cv', 'skills'],
    queryFn: cvApi.getSkills,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skill: Partial<CVSkill>) => cvApi.createSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, skill }: { id: string; skill: Partial<CVSkill> }) =>
      cvApi.updateSkill(id, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvApi.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv'] });
    },
  });
}