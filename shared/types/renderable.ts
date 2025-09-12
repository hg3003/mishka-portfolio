export interface RenderableColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  light: string;
}

export interface RenderableSettings {
  heroHeightMm?: number;
  stripHeightMm?: number;
  techHeightMm?: number;
  thumbHeightMm?: number;
}

export interface RenderableMargins {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface RenderableImage {
  path: string;
  caption?: string | null;
}

export interface RenderableProject {
  id: string;
  name: string;
  projectType?: string | null;
  location?: string | null;
  yearStart?: number | null;
  yearCompletion?: number | null;
  briefDescription?: string | null;
  detailedDescription?: string | null;
  designApproach?: string | null;
  projectValue?: number | null;
  projectSize?: number | null;
  role?: string | null;
  teamSize?: number | null;
  responsibilities?: string[] | null;
  ribaStages?: string[] | null;
  softwareUsed?: string[] | null;
  sustainabilityFeatures?: string | null;
  keyChallenges?: string | null;
  solutionsProvided?: string | null;
  skillsDemonstrated?: string[] | null;
  hero?: RenderableImage | null;
  images: RenderableImage[];
}

export type ExtendedRenderableProject = RenderableProject;

export interface RenderableCVPersonalInfo {
  name?: string | null;
  professionalTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  professionalSummary?: string | null;
}

export interface RenderableCVExperience {
  companyName: string;
  positionTitle: string;
  location: string;
  startDate: string; // ISO
  endDate?: string | null; // ISO or null
  description: string;
}

export interface RenderableCVEducation {
  institutionName: string;
  degreeType: string;
  fieldOfStudy: string;
  location: string;
  startDate: string; // ISO
  endDate?: string | null; // ISO or null
  grade?: string | null;
}

export interface RenderableCVSkill {
  category: string;
  skillName: string;
  proficiencyLevel: string;
  yearsExperience?: number | null;
}

export interface RenderableCVData {
  personalInfo?: RenderableCVPersonalInfo | null;
  experiences: RenderableCVExperience[];
  education: RenderableCVEducation[];
  skills: RenderableCVSkill[];
}

export interface RenderablePortfolio {
  portfolioName: string;
  createdAt: string;
  includeCV: boolean;
  margins?: RenderableMargins;
  projects: RenderableProject[];
  cv?: RenderableCVData | null;
  personalHeader?: string | null;
  colorScheme?: RenderableColorScheme | null;
  settings?: RenderableSettings | null;
}
