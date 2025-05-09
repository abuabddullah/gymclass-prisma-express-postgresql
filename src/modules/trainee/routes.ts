import { Router } from 'express';
import { 
  updateProfile, 
  createBooking, 
  cancelBooking, 
  getAvailableSchedules,
  getTraineeBookings
} from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Middleware to restrict access to trainees only
router.use(authenticate, authorize(UserRole.TRAINEE));

// Routes
router.put('/profile', updateProfile);
router.post('/bookings', createBooking);
router.delete('/bookings/:id', cancelBooking);
router.get('/schedules', getAvailableSchedules);
router.get('/bookings', getTraineeBookings);

export default router;