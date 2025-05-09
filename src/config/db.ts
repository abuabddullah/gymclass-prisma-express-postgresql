import { PrismaClient } from '@prisma/client';
import { createAdminUser } from '../utils/seedUtils';

// Initialize Prisma client
const prisma = new PrismaClient();

// Export prisma instance for use in other files
export { prisma };

// Connect to database
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('🔌 Connected to database');
    
    // Create admin user if it doesn't exist
    await createAdminUser();
  } catch (error) {
    console.error('Error connecting to database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};