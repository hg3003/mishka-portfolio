// backend/src/schemas/validation.ts
import { z } from 'zod';

/**
 * Helpers
 */

// Trim a required string and enforce min/max
const reqString = (min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().min(min).max(max)
  );

// Trim an optional string; treat ''/null/undefined as undefined; enforce max
const optString = (max: number) =>
  z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v !== 'string') return v;
    const t = v.trim();
    return t === '' ? undefined : t;
  }, z.string().max(max).optional());

// Optional URL string; treat ''/null/undefined as undefined; add https:// if missing
const optUrlString = z.preprocess((v) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if (t === '') return undefined;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  return withProto;
}, z.string().url().optional());

// Accept either YYYY-MM-DD or full RFC 3339 datetime; coerce date-only to T00:00:00.000Z
const dateTimeString = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T00:00:00.000Z`;
  return t;
}, z.string().datetime({ offset: true }));

// Optional version of the above (''/null/undefined => undefined)
const optDateTimeString = z.preprocess((v) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'string') return v;
  const t = v.trim();
  if (t === '') return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T00:00:00.000Z`;
  return t;
}, z.string().datetime({ offset: true }).optional());

// Trim array of strings (optional)
const optStringArray = z
  .array(z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string()))
  .optional();

/**
 * ==================== Common Schemas ====================
 */

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * ==================== Project Schemas ====================
 */

export const projectTypeEnum = z.enum([
  'RESIDENTIAL',
  'COMMERCIAL',
  'CULTURAL',
  'EDUCATIONAL',
  'HEALTHCARE',
  'HOSPITALITY',
  'INDUSTRIAL',
  'LANDSCAPE',
  'MIXED_USE',
  'PUBLIC',
  'RELIGIOUS',
  'RETAIL',
  'SPORTS',
  'TRANSPORT',
  'URBAN_PLANNING',
  'OTHER',
]);

export const ribaStageEnum = z.enum([
  'STAGE_0_STRATEGIC_DEFINITION',
  'STAGE_1_PREPARATION_BRIEF',
  'STAGE_2_CONCEPT_DESIGN',
  'STAGE_3_SPATIAL_COORDINATION',
  'STAGE_4_TECHNICAL_DESIGN',
  'STAGE_5_MANUFACTURING_CONSTRUCTION',
  'STAGE_6_HANDOVER',
  'STAGE_7_USE',
]);

export const createProjectSchema = z.object({
  projectName: reqString(1, 200),
  projectType: projectTypeEnum,
  location: reqString(1, 200),
  yearStart: z.coerce.number().min(1900).max(2100),
  yearCompletion: z.coerce.number().min(1900).max(2100).optional(),
  clientName: optString(200),
  practiceName: reqString(1, 200),
  projectValue: z.coerce.number().positive().optional(),
  projectSize: z.coerce.number().positive().optional(),

  // Role & Involvement
  role: reqString(1, 100),
  teamSize: z.coerce.number().positive().optional(),
  responsibilities: z.array(z.string()),

  // RIBA Stages
  ribaStages: z.array(ribaStageEnum),

  // Project Details
  briefDescription: reqString(1, 500),
  detailedDescription: optString(5000),
  designApproach: optString(2000),
  keyChallenges: optString(2000),
  solutionsProvided: optString(2000),
  sustainabilityFeatures: optString(2000),

  // Skills/Software
  softwareUsed: z.array(z.string()),
  skillsDemonstrated: z.array(z.string()),

  // Metadata
  isAcademic: z.boolean().default(false),
  isCompetition: z.boolean().default(false),
  awardsReceived: z.array(z.string()).optional(),
  featuredPriority: z.coerce.number().min(1).max(10).default(5),
  tags: z.array(z.string()),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdSchema = z.object({
  id: z.string().cuid(),
});

export const projectQuerySchema = z.object({
  projectType: projectTypeEnum.optional(),
  isAcademic: z.coerce.boolean().optional(),
  isCompetition: z.coerce.boolean().optional(),
  yearStart: z.coerce.number().optional(),
  yearEnd: z.coerce.number().optional(),
  search: z.string().optional(),
});

/**
 * ==================== Asset Schemas ====================
 */

export const assetTypeEnum = z.enum([
  'IMAGE',
  'DRAWING',
  'DIAGRAM',
  'MODEL_PHOTO',
  'RENDER',
  'SKETCH',
]);

export const drawingTypeEnum = z.enum([
  'PLAN',
  'SECTION',
  'ELEVATION',
  'DETAIL',
  'AXONOMETRIC',
  'PERSPECTIVE',
  'SITE_PLAN',
]);

export const assetSizeEnum = z.enum([
  'FULL_PAGE',
  'HALF_PAGE',
  'QUARTER_PAGE',
  'THIRD_PAGE',
  'TWO_THIRDS_PAGE',
]);

export const updateAssetSchema = z.object({
  title: optString(200),
  caption: optString(500),
  assetType: assetTypeEnum.optional(),
  drawingType: drawingTypeEnum.optional(),
  scale: optString(50),
  stage: ribaStageEnum.optional(),
  displayOrder: z.coerce.number().min(0).optional(),
  isHeroImage: z.boolean().optional(),
  preferredSize: assetSizeEnum.optional(),
  canBeCropped: z.boolean().optional(),
  focalPointX: z.coerce.number().min(0).max(1).optional(),
  focalPointY: z.coerce.number().min(0).max(1).optional(),
});

/**
 * ==================== CV Schemas ====================
 */

export const createExperienceSchema = z.object({
  companyName: reqString(1, 200),
  positionTitle: reqString(1, 200),
  location: reqString(1, 200),
  startDate: dateTimeString,            // accepts YYYY-MM-DD or full ISO
  endDate: optDateTimeString,           // accepts YYYY-MM-DD, ISO, or omitted
  isCurrent: z.boolean().default(false),
  description: reqString(1, 2000),
  keyProjects: optStringArray,
  keyAchievements: optStringArray,
  displayOrder: z.coerce.number().min(0).default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export const createEducationSchema = z.object({
  institutionName: reqString(1, 200),
  degreeType: reqString(1, 100),        // free text allowed; trimmed
  fieldOfStudy: reqString(1, 200),
  location: reqString(1, 200),
  startDate: dateTimeString,            // accepts YYYY-MM-DD or full ISO
  endDate: optDateTimeString,           // accepts YYYY-MM-DD, ISO, or omitted
  grade: optString(100),
  relevantCoursework: optStringArray,
  displayOrder: z.coerce.number().min(0).default(0),
});

export const updateEducationSchema = createEducationSchema.partial();

export const skillCategoryEnum = z.enum([
  'SOFTWARE',
  'TECHNICAL',
  'DESIGN',
  'MANAGEMENT',
  'COMMUNICATION',
  'OTHER',
]);

export const proficiencyLevelEnum = z.enum([
  'BASIC',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
]);

export const createSkillSchema = z.object({
  category: skillCategoryEnum,
  skillName: reqString(1, 100),
  proficiencyLevel: proficiencyLevelEnum,
  yearsExperience: z.coerce.number().min(0).max(50).optional(),
  displayOrder: z.coerce.number().min(0).default(0),
});

export const updateSkillSchema = createSkillSchema.partial();

/**
 * ==================== Personal Info Schemas ====================
 */

export const updatePersonalInfoSchema = z.object({
  name: reqString(1, 200).optional(),
  professionalTitle: reqString(1, 200).optional(),
  arbNumber: optString(50),
  email: z
    .preprocess((v) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v !== 'string') return v;
      const t = v.trim();
      return t === '' ? undefined : t;
    }, z.string().email())
    .optional(),
  phone: optString(50),
  location: optString(200),
  linkedinUrl: optUrlString,
  websiteUrl: optUrlString,
  professionalSummary: optString(1000),
  careerObjectives: optString(1000),
});

/**
 * ==================== Portfolio Schemas ====================
 */

export const portfolioTypeEnum = z.enum(['SAMPLE', 'FULL']);

export const createPortfolioSchema = z.object({
  portfolioName: reqString(1, 200),
  portfolioType: portfolioTypeEnum,
  templateId: z.string().cuid().optional(),
  cvIncluded: z.boolean().default(false),
  projects: z.array(
    z.object({
      projectId: z.string().cuid(),
      displayOrder: z.coerce.number().min(0),
      includedAssets: z.array(z.string().cuid()),
    })
  ),
  settings: z.record(z.any()).optional(),
});

/**
 * ==================== Response Schemas ====================
 */

export const successResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;