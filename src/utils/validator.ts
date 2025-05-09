import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).default(UserRole.TRAINEE)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Admin validation schemas
export const createTrainerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const createScheduleSchema = z.object({
  trainerId: z.number().int().positive('Trainer ID must be a positive integer'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid start time format'
  }),
  endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid end time format'
  })
});

export const updateScheduleSchema = z.object({
  trainerId: z.number().int().positive('Trainer ID must be a positive integer').optional()
});

// Trainee validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
});

export const createBookingSchema = z.object({
  scheduleId: z.number().int().positive('Schedule ID must be a positive integer')
});