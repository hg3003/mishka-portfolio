// Test file to debug imports
import { projectRoutes } from './routes/projects';
import { cvRoutes } from './routes/cv';
import { prisma } from './utils/db';

console.log('projectRoutes type:', typeof projectRoutes);
console.log('cvRoutes type:', typeof cvRoutes);
console.log('prisma type:', typeof prisma);

if (typeof projectRoutes !== 'function') {
  console.error('❌ projectRoutes is not a function!');
}

if (typeof cvRoutes !== 'function') {
  console.error('❌ cvRoutes is not a function!');
}

if (!prisma) {
  console.error('❌ prisma is not defined!');
}

console.log('✅ All imports checked');