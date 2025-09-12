// Centralized domain types

export interface Project {
  id: string;
  projectName: string;
  projectType: string;
  location: string;
  yearStart: number;
  yearCompletion?: number;
  clientName?: string;
  practiceName: string;
  projectValue?: number;
  projectSize?: number;
  role: string;
  teamSize?: number;
  responsibilities: any[];
  ribaStages: any[];
  briefDescription: string;
  detailedDescription?: string;
  designApproach?: string;
  keyChallenges?: string;
  solutionsProvided?: string;
  sustainabilityFeatures?: string;
  softwareUsed: any[];
  skillsDemonstrated: any[];
  isAcademic: boolean;
  isCompetition: boolean;
  awardsReceived?: any[];
  featuredPriority: number;
  tags: any[];
  assets?: ProjectAsset[];
  _count?: {
    assets: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  assetType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  title?: string;
  caption?: string;
  drawingType?: string;
  scale?: string;
  stage?: string;
  displayOrder: number;
  isHeroImage: boolean;
  preferredSize?: string;
  canBeCropped: boolean;
  focalPointX?: number;
  focalPointY?: number;
  url?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface CVExperience {
  id: string;
  companyName: string;
  positionTitle: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  keyProjects?: any[];
  keyAchievements?: any[];
  displayOrder: number;
}

export interface CVEducation {
  id: string;
  institutionName: string;
  degreeType: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  relevantCoursework?: any[];
  displayOrder: number;
}

export interface CVSkill {
  id: string;
  category: string;
  skillName: string;
  proficiencyLevel: string;
  yearsExperience?: number;
  displayOrder: number;
}

export interface Portfolio {
  id: string;
  portfolioName: string;
  portfolioType: 'SAMPLE' | 'FULL';
  templateId?: string;
  template?: PortfolioTemplate;
  cvIncluded: boolean;
  filePath?: string;
  totalPages?: number;
  fileSize?: number;
  settings?: any;
  projects?: PortfolioProject[];
  _count?: {
    projects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioTemplate {
  id: string;
  templateName: string;
  description?: string;
  layoutStyle: string;
  fontsConfig: any;
  colorScheme: any;
  pageLayouts: any;
  marginsConfig: any;
  isDefault: boolean;
}

export interface PortfolioProject {
  id: string;
  portfolioId: string;
  projectId: string;
  project?: Project;
  displayOrder: number;
  includedAssets: any[];
  customLayout?: any;
}

export interface CVData {
  personalInfo: PersonalInfo | null;
  experiences: CVExperience[];
  education: CVEducation[];
  skills: CVSkill[];
}