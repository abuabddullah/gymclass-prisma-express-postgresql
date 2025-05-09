import { Router } from 'express';
import { getTrainerSchedules } from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Middleware to restrict access to trainers only
router.use(authenticate, authorize(UserRole.TRAINER));

// Routes
router.get('/schedules', getTrainerSchedules);

export default router;