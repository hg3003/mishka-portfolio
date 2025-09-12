import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfoliosApi } from '../services/portfolios';
import type { Portfolio } from '../services/types';

// ==================== Portfolios Hooks ====================

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: portfoliosApi.getAll,
  });
}

export function usePortfolio(id: string) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => portfoliosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: portfoliosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, portfolio }: { id: string; portfolio: Partial<Portfolio> }) =>
      portfoliosApi.update(id, portfolio),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portfoliosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

export function usePortfolioTemplates() {
  return useQuery({
    queryKey: ['portfolio-templates'],
    queryFn: portfoliosApi.getTemplates,
  });
}

export function useDuplicatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portfoliosApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

// Generate (or regenerate) a portfolio PDF
export function useGeneratePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portfoliosApi.generate(id),
    onSuccess: (_data, id) => {
      // Refresh both list and detail so filePath/download becomes available
      queryClient.invalidateQueries({ queryKey: ['portfolio', id as string] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}