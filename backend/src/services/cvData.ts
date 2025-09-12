// backend/src/services/cvData.ts
import { prisma } from '../utils/db';

const colorSchemes = {
  classic: { primary: '#000', secondary: '#666', accent: '#DC2626', text: '#000', light: '#F5F5F5' },
  modernBlue: { primary: '#000', secondary: '#666', accent: '#2563EB', text: '#000', light: '#F5F5F5' },
  warmMinimal: { primary: '#000', secondary: '#666', accent: '#EA580C', text: '#000', light: '#F5F5F5' },
} as const;

export async function buildRenderableCV() {
  const [personalInfo, experiences, education, skills, appSettings] = await Promise.all([
    prisma.personalInfo.findFirst(),
    prisma.cVExperience.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.cVEducation.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.cVSkill.findMany({ orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }] }),
    prisma.appSettings.findUnique({ where: { id: 'global' } }),
  ]);

  // Global appearance
  const schemeKey = (appSettings?.colorScheme as keyof typeof colorSchemes) || 'classic';
  const colors = colorSchemes[schemeKey] || colorSchemes.classic;
  const margins = appSettings?.margins && typeof appSettings.margins === 'object'
    ? {
        top: Number((appSettings.margins as any).top) || 15,
        bottom: Number((appSettings.margins as any).bottom) || 15,
        left: Number((appSettings.margins as any).left) || 15,
        right: Number((appSettings.margins as any).right) || 15,
      }
    : { top: 15, bottom: 15, left: 15, right: 15 };

  return {
    createdAt: new Date().toISOString(),
    personalHeader: personalInfo ? [personalInfo.name, personalInfo.professionalTitle].filter(Boolean).join(' — ') : null,
    colorScheme: colors,
    margins,
    cv: {
      personalInfo: personalInfo ? {
        name: personalInfo.name,
        professionalTitle: personalInfo.professionalTitle,
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        linkedinUrl: personalInfo.linkedinUrl,
        websiteUrl: personalInfo.websiteUrl,
        professionalSummary: personalInfo.professionalSummary,
      } : null,
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
    },
  };
}
