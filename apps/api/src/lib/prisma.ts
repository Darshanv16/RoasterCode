import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:rFyLDRZEclNWibSMDeMCnMMPKZlPXziM@postgres.railway.internal:5432/railway';

export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;