import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '../services/assets';
import type { ProjectAsset } from '../services/types';

// ==================== Assets Hooks ====================

export function useUploadAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      assetsApi.upload(projectId, file),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUploadMultipleAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, files }: { projectId: string; files: File[] }) =>
      assetsApi.uploadMultiple(projectId, files),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, asset }: { id: string; asset: Partial<ProjectAsset> }) =>
      assetsApi.update(id, asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Note: if you want to be more specific, pass the projectId and invalidate ['project', projectId]
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useSetHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assetsApi.setHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}