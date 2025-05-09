import { prisma } from '../config/db';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

// Create admin user if it doesn't exist
export const createAdminUser = async (): Promise<void> => {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('000000', 10);
      
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@admin.admin',
          password: hashedPassword,
          role: UserRole.ADMIN
        }
      });
      
      console.log('👤 Admin user created');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};