import { Router } from 'express';
import { 
  createTrainer, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  getTrainers,
  getSchedules
} from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Middleware to restrict access to admin only
router.use(authenticate, authorize(UserRole.ADMIN));

// Routes
router.post('/trainers', createTrainer);
router.get('/trainers', getTrainers);
router.post('/schedules', createSchedule);
router.get('/schedules', getSchedules);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

export default router;