// Legacy aggregator to avoid breaking existing imports.
// Prefer importing from domain-specific hooks files directly.

export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from './useProjects';

export {
  useUploadAsset,
  useUploadMultipleAssets,
  useUpdateAsset,
  useDeleteAsset,
  useSetHeroImage,
} from './useAssets';

export {
  useCVData,
  usePersonalInfo,
  useUpdatePersonalInfo,
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useEducation,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  useSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from './useCV';

export {
  usePortfolios,
  usePortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
  usePortfolioTemplates,
  useDuplicatePortfolio,
  useGeneratePortfolio,
} from './usePortfolios';

export { useStats } from './useStats';