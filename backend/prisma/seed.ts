import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.portfolioProject.deleteMany();
  await prisma.generatedPortfolio.deleteMany();
  await prisma.portfolioTemplate.deleteMany();
  await prisma.projectAsset.deleteMany();
  await prisma.project.deleteMany();
  await prisma.cVExperience.deleteMany();
  await prisma.cVEducation.deleteMany();
  await prisma.cVSkill.deleteMany();
  await prisma.personalInfo.deleteMany();

  // Create Personal Info
  const personalInfo = await prisma.personalInfo.create({
    data: {
      name: 'Sarah Johnson',
      professionalTitle: 'Architectural Assistant Part 2',
      email: 'sarah.johnson@example.com',
      phone: '+44 20 7123 4567',
      location: 'London, UK',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      professionalSummary: 'Creative and detail-oriented Architectural Assistant with 3+ years of experience in residential and cultural projects. Passionate about sustainable design and digital fabrication techniques.',
    },
  });

  console.log('✅ Created personal info');

  // Create CV Experience
  const experiences = await Promise.all([
    prisma.cVExperience.create({
      data: {
        companyName: 'Foster + Partners',
        positionTitle: 'Architectural Assistant Part 2',
        location: 'London, UK',
        startDate: new Date('2022-09-01'),
        isCurrent: true,
        description: 'Working on large-scale residential and mixed-use developments. Leading BIM coordination for a 200-unit housing project.',
        keyProjects: ['Battersea Residential Tower', 'Kings Cross Mixed-Use Development'],
        keyAchievements: [
          'Led BIM coordination for 200-unit residential project',
          'Developed parametric facade system reducing costs by 15%',
          'Managed team of 3 Part 1 assistants',
        ],
        displayOrder: 1,
      },
    }),
    prisma.cVExperience.create({
      data: {
        companyName: 'Zaha Hadid Architects',
        positionTitle: 'Architectural Assistant Part 1',
        location: 'London, UK',
        startDate: new Date('2021-06-01'),
        endDate: new Date('2022-08-31'),
        isCurrent: false,
        description: 'Contributed to competition entries and concept design for cultural projects.',
        keyProjects: ['Museum of Contemporary Art Competition', 'Beijing Opera House'],
        keyAchievements: [
          'Created presentation drawings for winning competition entry',
          'Developed complex Grasshopper definitions for facade optimization',
        ],
        displayOrder: 2,
      },
    }),
  ]);

  console.log('✅ Created CV experiences');

  // Create CV Education
  const education = await Promise.all([
    prisma.cVEducation.create({
      data: {
        institutionName: 'The Bartlett School of Architecture, UCL',
        degreeType: 'MArch Architecture (RIBA Part 2)',
        fieldOfStudy: 'Architecture',
        location: 'London, UK',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2022-06-30'),
        grade: 'Distinction',
        relevantCoursework: [
          'Advanced Digital Design',
          'Sustainable Technologies',
          'Urban Regeneration',
          'Computational Design',
        ],
        displayOrder: 1,
      },
    }),
    prisma.cVEducation.create({
      data: {
        institutionName: 'University of Cambridge',
        degreeType: 'BA Architecture (RIBA Part 1)',
        fieldOfStudy: 'Architecture',
        location: 'Cambridge, UK',
        startDate: new Date('2017-09-01'),
        endDate: new Date('2020-06-30'),
        grade: 'First Class Honours',
        relevantCoursework: [
          'Architectural History',
          'Structural Design',
          'Environmental Design',
          'Studio Design Projects',
        ],
        displayOrder: 2,
      },
    }),
  ]);

  console.log('✅ Created CV education');

  // Create CV Skills
  const skills = await Promise.all([
    // Software Skills
    prisma.cVSkill.create({
      data: {
        category: 'SOFTWARE',
        skillName: 'Revit',
        proficiencyLevel: 'EXPERT',
        yearsExperience: 4,
        displayOrder: 1,
      },
    }),
    prisma.cVSkill.create({
      data: {
        category: 'SOFTWARE',
        skillName: 'AutoCAD',
        proficiencyLevel: 'EXPERT',
        yearsExperience: 6,
        displayOrder: 2,
      },
    }),
    prisma.cVSkill.create({
      data: {
        category: 'SOFTWARE',
        skillName: 'Rhino + Grasshopper',
        proficiencyLevel: 'ADVANCED',
        yearsExperience: 4,
        displayOrder: 3,
      },
    }),
    prisma.cVSkill.create({
      data: {
        category: 'SOFTWARE',
        skillName: 'Adobe Creative Suite',
        proficiencyLevel: 'ADVANCED',
        yearsExperience: 5,
        displayOrder: 4,
      },
    }),
    // Technical Skills
    prisma.cVSkill.create({
      data: {
        category: 'TECHNICAL',
        skillName: 'BIM Coordination',
        proficiencyLevel: 'ADVANCED',
        yearsExperience: 3,
        displayOrder: 5,
      },
    }),
    prisma.cVSkill.create({
      data: {
        category: 'TECHNICAL',
        skillName: 'Technical Detailing',
        proficiencyLevel: 'ADVANCED',
        yearsExperience: 3,
        displayOrder: 6,
      },
    }),
    prisma.cVSkill.create({
      data: {
        category: 'DESIGN',
        skillName: 'Concept Design',
        proficiencyLevel: 'ADVANCED',
        yearsExperience: 4,
        displayOrder: 7,
      },
    }),
  ]);

  console.log('✅ Created CV skills');

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      projectName: 'Thames Riverside Housing',
      projectType: 'RESIDENTIAL',
      location: 'London, UK',
      yearStart: 2023,
      yearCompletion: 2025,
      clientName: 'Berkeley Group',
      practiceName: 'Foster + Partners',
      projectValue: 45000000,
      projectSize: 12000,
      role: 'Architectural Assistant Part 2',
      teamSize: 8,
      responsibilities: [
        'BIM coordination and management',
        'Design development of facade systems',
        'Production of technical drawings',
        'Coordination with consultants',
      ],
      ribaStages: [
        'STAGE_2_CONCEPT_DESIGN',
        'STAGE_3_SPATIAL_COORDINATION',
        'STAGE_4_TECHNICAL_DESIGN',
      ],
      briefDescription:
        'A 150-unit riverside residential development featuring sustainable design principles and community spaces.',
      detailedDescription:
        'This ambitious residential project transforms a brownfield site along the Thames into a vibrant community. The development includes 150 units ranging from studios to 3-bedroom apartments, with 30% designated as affordable housing. The design emphasizes connection to the riverside through terraced gardens and public walkways.',
      designApproach:
        'The design responds to the riverside context with a stepped massing that maximizes views and daylight. Materials reference the industrial heritage of the site while providing a contemporary aesthetic.',
      keyChallenges:
        'Flood risk mitigation, integration with existing infrastructure, achieving Passivhaus standards',
      solutionsProvided:
        'Elevated ground floor, permeable landscaping, high-performance envelope with triple glazing',
      sustainabilityFeatures:
        'Passivhaus certification target, PV panels, rainwater harvesting, biodiversity roof',
      softwareUsed: ['Revit', 'Navisworks', 'Dynamo', 'AutoCAD'],
      skillsDemonstrated: [
        'BIM Management',
        'Technical Detailing',
        'Sustainable Design',
        'Team Coordination',
      ],
      isAcademic: false,
      isCompetition: false,
      featuredPriority: 1,
      tags: ['residential', 'sustainable', 'riverside', 'london'],
      assets: {
        create: [
          {
            assetType: 'RENDER',
            filePath: '/uploads/thames-riverside-hero.jpg',
            fileName: 'thames-riverside-hero.jpg',
            fileSize: 2048000,
            mimeType: 'image/jpeg',
            width: 3840,
            height: 2160,
            title: 'Riverside View',
            caption: 'View from Thames Path showing stepped massing',
            displayOrder: 1,
            isHeroImage: true,
            preferredSize: 'FULL_PAGE',
            canBeCropped: false,
          },
          {
            assetType: 'DRAWING',
            filePath: '/uploads/thames-floor-plan.pdf',
            fileName: 'thames-floor-plan.pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            title: 'Typical Floor Plan',
            caption: 'Level 3-7 typical floor plan',
            drawingType: 'PLAN',
            scale: '1:200',
            stage: 'STAGE_4_TECHNICAL_DESIGN',
            displayOrder: 2,
            preferredSize: 'FULL_PAGE',
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      projectName: 'Museum of Digital Art',
      projectType: 'CULTURAL',
      location: 'Berlin, Germany',
      yearStart: 2022,
      yearCompletion: 2022,
      clientName: 'Competition Entry',
      practiceName: 'Zaha Hadid Architects',
      projectSize: 8000,
      role: 'Architectural Assistant Part 1',
      teamSize: 5,
      responsibilities: [
        'Parametric design development',
        'Visualization and rendering',
        'Physical model making',
        'Presentation drawing production',
      ],
      ribaStages: ['STAGE_1_PREPARATION_BRIEF', 'STAGE_2_CONCEPT_DESIGN'],
      briefDescription:
        'Competition entry for a new museum dedicated to digital and interactive art in Berlin.',
      detailedDescription:
        'The design explores the intersection of physical and digital space through a dynamic facade system that responds to visitor interaction. The building features flexible gallery spaces that can adapt to various digital art installations.',
      designApproach:
        'Using parametric design tools to create a responsive architecture that embodies the digital nature of the art it houses.',
      softwareUsed: ['Rhino', 'Grasshopper', 'V-Ray', 'Illustrator'],
      skillsDemonstrated: ['Parametric Design', 'Visualization', 'Concept Development'],
      isAcademic: false,
      isCompetition: true,
      awardsReceived: ['Shortlisted - Final 10'],
      featuredPriority: 2,
      tags: ['cultural', 'competition', 'parametric', 'museum'],
    },
  });

  const project3 = await prisma.project.create({
    data: {
      projectName: 'Urban Farming Tower',
      projectType: 'MIXED_USE',
      location: 'London, UK',
      yearStart: 2021,
      yearCompletion: 2022,
      practiceName: 'The Bartlett School of Architecture',
      projectSize: 5000,
      role: 'MArch Student',
      teamSize: 1,
      responsibilities: ['Complete design development', 'Research', 'Technical resolution'],
      ribaStages: [
        'STAGE_0_STRATEGIC_DEFINITION',
        'STAGE_1_PREPARATION_BRIEF',
        'STAGE_2_CONCEPT_DESIGN',
        'STAGE_3_SPATIAL_COORDINATION',
      ],
      briefDescription:
        'MArch thesis project exploring vertical farming integration in urban residential development.',
      detailedDescription:
        'This thesis project investigates how vertical farming can be integrated into high-density urban housing to create self-sufficient communities. The tower combines residential units with hydroponic growing systems, community kitchens, and market spaces.',
      designApproach:
        'A systematic approach to integrating food production into residential architecture, using modular growing systems and shared community spaces.',
      sustainabilityFeatures:
        'Closed-loop water systems, integrated renewable energy, food mile reduction',
      softwareUsed: ['Revit', 'Grasshopper', 'EnergyPlus', 'Lumion'],
      skillsDemonstrated: ['Research', 'Sustainable Design', 'Systems Integration'],
      isAcademic: true,
      isCompetition: false,
      awardsReceived: ['RIBA President Medal Nomination'],
      featuredPriority: 3,
      tags: ['academic', 'sustainable', 'urban-farming', 'thesis'],
    },
  });

  console.log('✅ Created projects');

  // Create Portfolio Template
  const template = await prisma.portfolioTemplate.create({
    data: {
      templateName: 'Swiss Minimal',
      description: 'Clean, minimal portfolio template inspired by Swiss design principles',
      layoutStyle: 'minimal',
      fontsConfig: {
        heading: 'Helvetica Neue',
        body: 'Helvetica',
        size: {
          base: 10,
          h1: 24,
          h2: 18,
          h3: 14,
        },
      },
      colorScheme: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#FF0000',
      },
      pageLayouts: {
        cover: 'minimal-cover',
        project: 'two-column',
        cv: 'single-column',
      },
      marginsConfig: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
      isDefault: true,
    },
  });

  console.log('✅ Created portfolio template');

  // Create a Sample Generated Portfolio
  const portfolio = await prisma.generatedPortfolio.create({
    data: {
      portfolioName: 'Sample Portfolio - Foster + Partners Application',
      templateId: template.id,
      portfolioType: 'SAMPLE',
      cvIncluded: true,
      settings: {
        includeContactInfo: true,
        includeTableOfContents: false,
        projectsPerPage: 1,
      },
      projects: {
        create: [
          {
            projectId: project1.id,
            displayOrder: 1,
            includedAssets: [], // Will include all assets by default
          },
          {
            projectId: project2.id,
            displayOrder: 2,
            includedAssets: [],
          },
        ],
      },
    },
  });

  console.log('✅ Created sample portfolio');

  console.log('🌱 Seed completed successfully!');
  console.log('📊 Database summary:');
  console.log(`   - Personal Info: 1 entry`);
  console.log(`   - CV Experiences: ${experiences.length} entries`);
  console.log(`   - CV Education: ${education.length} entries`);
  console.log(`   - CV Skills: ${skills.length} entries`);
  console.log(`   - Projects: 3 entries`);
  console.log(`   - Portfolio Templates: 1 entry`);
  console.log(`   - Generated Portfolios: 1 entry`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });