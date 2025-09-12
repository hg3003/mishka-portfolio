-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearCompletion" INTEGER,
    "clientName" TEXT,
    "practiceName" TEXT NOT NULL,
    "projectValue" REAL,
    "projectSize" REAL,
    "role" TEXT NOT NULL,
    "teamSize" INTEGER,
    "responsibilities" JSONB NOT NULL,
    "ribaStages" JSONB NOT NULL,
    "briefDescription" TEXT NOT NULL,
    "detailedDescription" TEXT,
    "designApproach" TEXT,
    "keyChallenges" TEXT,
    "solutionsProvided" TEXT,
    "sustainabilityFeatures" TEXT,
    "softwareUsed" JSONB NOT NULL,
    "skillsDemonstrated" JSONB NOT NULL,
    "isAcademic" BOOLEAN NOT NULL DEFAULT false,
    "isCompetition" BOOLEAN NOT NULL DEFAULT false,
    "awardsReceived" JSONB,
    "featuredPriority" INTEGER NOT NULL DEFAULT 5,
    "tags" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "title" TEXT,
    "caption" TEXT,
    "drawingType" TEXT,
    "scale" TEXT,
    "stage" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isHeroImage" BOOLEAN NOT NULL DEFAULT false,
    "preferredSize" TEXT,
    "canBeCropped" BOOLEAN NOT NULL DEFAULT true,
    "focalPointX" REAL,
    "focalPointY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CVExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "keyProjects" JSONB,
    "keyAchievements" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CVEducation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionName" TEXT NOT NULL,
    "degreeType" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "grade" TEXT,
    "relevantCoursework" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CVSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "proficiencyLevel" TEXT NOT NULL,
    "yearsExperience" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "arbNumber" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "professionalSummary" TEXT,
    "careerObjectives" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateName" TEXT NOT NULL,
    "description" TEXT,
    "layoutStyle" TEXT NOT NULL,
    "fontsConfig" JSONB NOT NULL,
    "colorScheme" JSONB NOT NULL,
    "pageLayouts" JSONB NOT NULL,
    "marginsConfig" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GeneratedPortfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioName" TEXT NOT NULL,
    "dateCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT,
    "portfolioType" TEXT NOT NULL,
    "cvIncluded" BOOLEAN NOT NULL DEFAULT false,
    "filePath" TEXT,
    "totalPages" INTEGER,
    "fileSize" INTEGER,
    "settings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedPortfolio_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PortfolioTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "includedAssets" JSONB NOT NULL,
    "customLayout" JSONB,
    CONSTRAINT "PortfolioProject_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "GeneratedPortfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PortfolioProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");

-- CreateIndex
CREATE INDEX "Project_yearStart_idx" ON "Project"("yearStart");

-- CreateIndex
CREATE INDEX "Project_featuredPriority_idx" ON "Project"("featuredPriority");

-- CreateIndex
CREATE INDEX "ProjectAsset_projectId_idx" ON "ProjectAsset"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAsset_displayOrder_idx" ON "ProjectAsset"("displayOrder");

-- CreateIndex
CREATE INDEX "CVExperience_displayOrder_idx" ON "CVExperience"("displayOrder");

-- CreateIndex
CREATE INDEX "CVEducation_displayOrder_idx" ON "CVEducation"("displayOrder");

-- CreateIndex
CREATE INDEX "CVSkill_category_idx" ON "CVSkill"("category");

-- CreateIndex
CREATE INDEX "CVSkill_displayOrder_idx" ON "CVSkill"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioTemplate_templateName_key" ON "PortfolioTemplate"("templateName");

-- CreateIndex
CREATE INDEX "GeneratedPortfolio_portfolioType_idx" ON "GeneratedPortfolio"("portfolioType");

-- CreateIndex
CREATE INDEX "PortfolioProject_portfolioId_idx" ON "PortfolioProject"("portfolioId");

-- CreateIndex
CREATE INDEX "PortfolioProject_projectId_idx" ON "PortfolioProject"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioProject_portfolioId_projectId_key" ON "PortfolioProject"("portfolioId", "projectId");
