// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
  }
  
  export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  // Query parameter types
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface ProjectQueryParams extends PaginationParams {
    projectType?: string;
    isAcademic?: boolean;
    isCompetition?: boolean;
    yearStart?: number;
    yearEnd?: number;
    search?: string;
  }
  
  // Re-export validation schemas for use in frontend
  export {
    createProjectSchema,
    updateProjectSchema,
    createExperienceSchema,
    updateExperienceSchema,
    createEducationSchema,
    updateEducationSchema,
    createSkillSchema,
    updateSkillSchema,
    updatePersonalInfoSchema,
    createPortfolioSchema,
  } from '../schemas/validation';