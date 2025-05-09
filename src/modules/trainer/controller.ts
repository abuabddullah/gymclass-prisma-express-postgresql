import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/db';
import { catchAsyncErrorsMiddleware } from '../../middleware/catchAsyncErrorsMiddleware';

// Get trainer schedules
export const getTrainerSchedules = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const trainerId = req.user.id;

  // Get trainer schedules
  const schedules = await prisma.classSchedule.findMany({
    where: { trainerId },
    include: {
      bookings: {
        include: {
          trainee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Trainer schedules fetched successfully',
    data: schedules
  });
});