// backend/src/services/portfolioData.ts
import { prisma } from '../utils/db';

export async function loadPortfolioForPdf(id: string) {
  const portfolio = await prisma.generatedPortfolio.findUnique({
    where: { id },
    include: {
      template: true,
      projects: {
        include: {
          project: {
            include: {
              assets: { orderBy: { displayOrder: 'asc' } },
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!portfolio) return null;

  const [personalInfo, experiences, education, skills] = await Promise.all([
    portfolio.cvIncluded ? prisma.personalInfo.findFirst() : Promise.resolve(null),
    portfolio.cvIncluded ? prisma.cVExperience.findMany({ orderBy: { displayOrder: 'asc' } }) : Promise.resolve([]),
    portfolio.cvIncluded ? prisma.cVEducation.findMany({ orderBy: { displayOrder: 'asc' } }) : Promise.resolve([]),
    portfolio.cvIncluded ? prisma.cVSkill.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] }) : Promise.resolve([]),
  ]);

  return { portfolio, personalInfo, experiences, education, skills };
}

export async function buildRenderablePortfolio(id: string) {
  const loaded = await loadPortfolioForPdf(id);
  if (!loaded) return null;

  const { portfolio, personalInfo, experiences, education, skills } = loaded;

  // Load global defaults (AppSettings) and then override with per-portfolio settings (if provided)
  const appSettings = await prisma.appSettings.findUnique({ where: { id: 'global' } });
  const settings = (portfolio.settings || {}) as any;

  // Map to renderable data with web URLs for images
  const projects = portfolio.projects.map(({ project, includedAssets }) => {
    const allAssets = project.assets;
    const withFile = allAssets.filter((a) => !!a.fileName);

    const hero = withFile.find((a) => a.isHeroImage) || withFile[0] || null;

    const included = Array.isArray(includedAssets) ? (includedAssets as string[]) : null;
    const selected = included && included.length > 0
      ? withFile.filter((a) => included.includes(a.id))
      : withFile;

    const ordered = hero && selected.some((a) => a.id === hero.id)
      ? [hero, ...selected.filter((a) => a.id !== hero.id)]
      : selected;

    const toWebUpload = (fileName?: string | null) =>
      fileName ? `/uploads/projects/optimized/${fileName}` : '';

    const ribaStages = Array.isArray(project.ribaStages) ? project.ribaStages.map((s: any) => String(s)) : [];
    const responsibilities = Array.isArray(project.responsibilities) ? project.responsibilities.map((s: any) => String(s)) : [];
    const softwareUsed = Array.isArray(project.softwareUsed) ? project.softwareUsed.map((s: any) => String(s)) : [];
    const skillsDemonstrated = Array.isArray(project.skillsDemonstrated) ? project.skillsDemonstrated.map((s: any) => String(s)) : [];

    return {
      name: project.projectName,
      type: project.projectType,
      year: project.yearCompletion ?? project.yearStart ?? null,
      brief: project.briefDescription,
      hero: hero ? { path: toWebUpload(hero.fileName), caption: hero.caption ?? null } : null,
      images: ordered
        .filter((a) => !hero || a.id !== hero.id)
        .map((a) => ({ path: toWebUpload(a.fileName), caption: a.caption ?? null })),

      id: project.id,
      projectType: project.projectType,
      location: project.location,
      yearStart: project.yearStart,
      yearCompletion: project.yearCompletion,
      clientName: project.clientName,
      practiceName: project.practiceName,
      projectValue: project.projectValue,
      projectSize: project.projectSize,
      role: project.role,
      teamSize: project.teamSize,
      responsibilities,
      ribaStages,
      briefDescription: project.briefDescription,
      detailedDescription: project.detailedDescription,
      designApproach: project.designApproach,
      keyChallenges: project.keyChallenges,
      solutionsProvided: project.solutionsProvided,
      sustainabilityFeatures: project.sustainabilityFeatures,
      softwareUsed,
      skillsDemonstrated,
    };
  });

  const colorSchemes = {
    classic: { primary: '#000', secondary: '#666', accent: '#DC2626', text: '#000', light: '#F5F5F5' },
    modernBlue: { primary: '#000', secondary: '#666', accent: '#2563EB', text: '#000', light: '#F5F5F5' },
    warmMinimal: { primary: '#000', secondary: '#666', accent: '#EA580C', text: '#000', light: '#F5F5F5' },
  } as const;
  const colorSchemeKey = (settings.colorScheme as keyof typeof colorSchemes) || (appSettings?.colorScheme as keyof typeof colorSchemes) || 'classic';
  const colors = colorSchemes[colorSchemeKey] || colorSchemes.classic;

  return {
    portfolioName: portfolio.portfolioName,
    createdAt: portfolio.createdAt.toISOString(),
    includeCV: portfolio.cvIncluded,
    margins: settings?.margins && typeof settings.margins === 'object'
      ? {
          top: Number(settings.margins.top) || 15,
          bottom: Number(settings.margins.bottom) || 15,
          left: Number(settings.margins.left) || 15,
          right: Number(settings.margins.right) || 15,
        }
      : appSettings?.margins && typeof appSettings.margins === 'object'
        ? {
            top: Number((appSettings.margins as any).top) || 15,
            bottom: Number((appSettings.margins as any).bottom) || 15,
            left: Number((appSettings.margins as any).left) || 15,
            right: Number((appSettings.margins as any).right) || 15,
          }
        : { top: 15, bottom: 15, left: 15, right: 15 },
    projects,
    colorScheme: colors,
    cv: portfolio.cvIncluded
      ? {
          personalInfo: personalInfo as any,
          experiences: (experiences || []).map((e) => ({
            companyName: e.companyName,
            positionTitle: e.positionTitle,
            location: e.location,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate ? e.endDate.toISOString() : null,
            description: e.description,
          })),
          education: (education || []).map((ed) => ({
            institutionName: ed.institutionName,
            degreeType: ed.degreeType,
            fieldOfStudy: ed.fieldOfStudy,
            location: ed.location,
            startDate: ed.startDate.toISOString(),
            endDate: ed.endDate ? ed.endDate.toISOString() : null,
            grade: ed.grade ?? null,
          })),
          skills: (skills || []).map((s) => ({
            category: s.category,
            skillName: s.skillName,
            proficiencyLevel: s.proficiencyLevel,
            yearsExperience: s.yearsExperience ?? null,
          })),
        }
      : undefined,
    personalHeader: personalInfo ? [personalInfo.name, personalInfo.professionalTitle].filter(Boolean).join(' — ') : null,
    settings: {
      heroHeightMm: settings.heroHeightMm ?? 200,
      stripHeightMm: settings.stripHeightMm ?? 120,
      techHeightMm: settings.techHeightMm ?? 120,
      thumbHeightMm: settings.thumbHeightMm ?? 40,
      defaultEngine: settings.defaultEngine ?? 'playwright',
    },
  };
}
