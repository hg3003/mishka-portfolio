// Project Types
export interface Project {
    id: string;
    projectName: string;
    projectType: ProjectType;
    location: string;
    yearStart: number;
    yearCompletion?: number;
    clientName?: string;
    practiceName: string;
    projectValue?: number;
    projectSize?: number;
    
    // Role & Involvement
    role: string;
    teamSize?: number;
    responsibilities: string[];
    
    // RIBA Stages
    ribaStages: RIBAStage[];
    
    // Project Details
    briefDescription: string;
    detailedDescription?: string;
    designApproach?: string;
    keyChallenges?: string;
    solutionsProvided?: string;
    sustainabilityFeatures?: string;
    
    // Skills/Software
    softwareUsed: string[];
    skillsDemonstrated: string[];
    
    // Metadata
    isAcademic: boolean;
    isCompetition: boolean;
    awardsReceived?: string[];
    featuredPriority: number;
    tags: string[];
    
    // Relations
    assets?: ProjectAsset[];
    
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum ProjectType {
    RESIDENTIAL = 'RESIDENTIAL',
    COMMERCIAL = 'COMMERCIAL',
    CULTURAL = 'CULTURAL',
    EDUCATIONAL = 'EDUCATIONAL',
    HEALTHCARE = 'HEALTHCARE',
    HOSPITALITY = 'HOSPITALITY',
    INDUSTRIAL = 'INDUSTRIAL',
    LANDSCAPE = 'LANDSCAPE',
    MIXED_USE = 'MIXED_USE',
    PUBLIC = 'PUBLIC',
    RELIGIOUS = 'RELIGIOUS',
    RETAIL = 'RETAIL',
    SPORTS = 'SPORTS',
    TRANSPORT = 'TRANSPORT',
    URBAN_PLANNING = 'URBAN_PLANNING',
    OTHER = 'OTHER'
  }
  
  export enum RIBAStage {
    STAGE_0 = 'STAGE_0_STRATEGIC_DEFINITION',
    STAGE_1 = 'STAGE_1_PREPARATION_BRIEF',
    STAGE_2 = 'STAGE_2_CONCEPT_DESIGN',
    STAGE_3 = 'STAGE_3_SPATIAL_COORDINATION',
    STAGE_4 = 'STAGE_4_TECHNICAL_DESIGN',
    STAGE_5 = 'STAGE_5_MANUFACTURING_CONSTRUCTION',
    STAGE_6 = 'STAGE_6_HANDOVER',
    STAGE_7 = 'STAGE_7_USE'
  }
  
  // Asset Types
  export interface ProjectAsset {
    id: string;
    projectId: string;
    assetType: AssetType;
    filePath: string;
    fileSize: number;
    width?: number;
    height?: number;
    
    // Asset Details
    title?: string;
    caption?: string;
    drawingType?: DrawingType;
    scale?: string;
    stage?: RIBAStage;
    displayOrder: number;
    isHeroImage: boolean;
    
    // Layout Hints
    preferredSize?: AssetSize;
    canBeCropped: boolean;
    focalPointX?: number;
    focalPointY?: number;
    
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum AssetType {
    IMAGE = 'IMAGE',
    DRAWING = 'DRAWING',
    DIAGRAM = 'DIAGRAM',
    MODEL_PHOTO = 'MODEL_PHOTO',
    RENDER = 'RENDER',
    SKETCH = 'SKETCH'
  }
  
  export enum DrawingType {
    PLAN = 'PLAN',
    SECTION = 'SECTION',
    ELEVATION = 'ELEVATION',
    DETAIL = 'DETAIL',
    AXONOMETRIC = 'AXONOMETRIC',
    PERSPECTIVE = 'PERSPECTIVE',
    SITE_PLAN = 'SITE_PLAN'
  }
  
  export enum AssetSize {
    FULL_PAGE = 'FULL_PAGE',
    HALF_PAGE = 'HALF_PAGE',
    QUARTER_PAGE = 'QUARTER_PAGE',
    THIRD_PAGE = 'THIRD_PAGE',
    TWO_THIRDS_PAGE = 'TWO_THIRDS_PAGE'
  }
  
  // CV Types
  export interface CVExperience {
    id: string;
    companyName: string;
    positionTitle: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description: string;
    keyProjects?: string[];
    keyAchievements?: string[];
    displayOrder: number;
  }
  
  export interface CVEducation {
    id: string;
    institutionName: string;
    degreeType: string;
    fieldOfStudy: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    grade?: string;
    relevantCoursework?: string[];
    displayOrder: number;
  }
  
  export interface CVSkill {
    id: string;
    category: SkillCategory;
    skillName: string;
    proficiencyLevel: ProficiencyLevel;
    yearsExperience?: number;
    displayOrder: number;
  }
  
  export enum SkillCategory {
    SOFTWARE = 'SOFTWARE',
    TECHNICAL = 'TECHNICAL',
    DESIGN = 'DESIGN',
    MANAGEMENT = 'MANAGEMENT',
    COMMUNICATION = 'COMMUNICATION',
    OTHER = 'OTHER'
  }
  
  export enum ProficiencyLevel {
    BASIC = 'BASIC',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
  }
  
  // Personal Info
  export interface PersonalInfo {
    id: string;
    name: string;
    professionalTitle: string;
    arbNumber?: string;
    email: string;
    phone?: string;
    location: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    professionalSummary?: string;
    careerObjectives?: string;
  }
  
  // Portfolio Types
  export interface PortfolioTemplate {
    id: string;
    templateName: string;
    layoutStyle: string;
    fontsConfig: Record<string, any>;
    colorScheme: Record<string, any>;
    pageLayouts: Record<string, any>;
    marginsConfig: Record<string, any>;
  }
  
  export interface GeneratedPortfolio {
    id: string;
    portfolioName: string;
    dateCreated: Date;
    templateUsed?: string;
    projectsIncluded: string[];
    assetsIncluded: Record<string, string[]>; // projectId -> assetIds[]
    cvIncluded: boolean;
    portfolioType: PortfolioType;
    filePath?: string;
    totalPages?: number;
    fileSize?: number;
  }
  
  export enum PortfolioType {
    SAMPLE = 'SAMPLE',
    FULL = 'FULL'
  }