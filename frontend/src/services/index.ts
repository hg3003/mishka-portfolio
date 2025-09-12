export { projectsApi } from './projects';
export { assetsApi } from './assets';
export { cvApi } from './cv';
export { portfoliosApi } from './portfolios';
export { statsApi } from './stats';

// Re-export sanitizers (useful for advanced callers or tests)
export {
  sanitizePersonalInfoPayload,
  sanitizeEducationPayload,
  sanitizeExperiencePayload,
} from './sanitizers';


// Re-export domain types
export type {
  Project,
  ProjectAsset,
  PersonalInfo,
  CVExperience,
  CVEducation,
  CVSkill,
  Portfolio,
  PortfolioTemplate,
  PortfolioProject,
  CVData,
} from './types';
