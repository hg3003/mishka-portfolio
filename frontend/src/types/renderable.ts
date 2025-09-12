export interface RenderablePortfolio {
  portfolioName: string;
  createdAt: string;
  includeCV: boolean;
  margins?: { top?: number; bottom?: number; left?: number; right?: number };
  projects: any[]; // keep permissive; backend populates fields used by preview
  cv?: any | null;
  personalHeader?: string | null;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    light: string;
  } | null;
  settings?: {
    heroHeightMm?: number;
    stripHeightMm?: number;
    techHeightMm?: number;
    thumbHeightMm?: number;
  } | null;
}
