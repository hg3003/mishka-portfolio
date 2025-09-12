import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Utility function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Utility function to get database stats
export async function getDatabaseStats() {
  const [
    projectCount,
    assetCount,
    experienceCount,
    educationCount,
    skillCount,
    portfolioCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.projectAsset.count(),
    prisma.cVExperience.count(),
    prisma.cVEducation.count(),
    prisma.cVSkill.count(),
    prisma.generatedPortfolio.count(),
  ]);

  return {
    projects: projectCount,
    assets: assetCount,
    experiences: experienceCount,
    education: educationCount,
    skills: skillCount,
    portfolios: portfolioCount,
    total:
      projectCount +
      assetCount +
      experienceCount +
      educationCount +
      skillCount +
      portfolioCount,
  };
}