import { Response, NextFunction, Request } from 'express';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { 
  createTrainerSchema, 
  createScheduleSchema, 
  updateScheduleSchema 
} from '../../utils/validator';
import { catchAsyncErrorsMiddleware } from '../../middleware/catchAsyncErrorsMiddleware';



// Create trainer
export const createTrainer = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = createTrainerSchema.parse(req.body);
  const { name, email, password } = validatedData;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create trainer
  const trainer = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.TRAINER
    }
  });

  // Send response
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Trainer created successfully',
    data: {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      role: trainer.role
    }
  });
});

// Create class schedule
export const createSchedule = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = createScheduleSchema.parse(req.body);
  const { trainerId, date, startTime, endTime } = validatedData;

  // Parse dates
  const scheduleDate = new Date(date);
  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  // Check if trainer exists
  const trainer = await prisma.user.findFirst({
    where: { 
      id: trainerId,
      role: UserRole.TRAINER 
    }
  });

  if (!trainer) {
    throw new ApiError(404, 'Trainer not found');
  }

  // Validate time difference (2 hours)
  const timeDifference = (parsedEndTime.getTime() - parsedStartTime.getTime()) / (1000 * 60 * 60);
  
  if (timeDifference !== 2) {
    throw new ApiError(400, 'Class duration must be exactly 2 hours');
  }

  // Check if maximum 5 schedules per day
  const scheduleCount = await prisma.classSchedule.count({
    where: {
      date: {
        gte: new Date(scheduleDate.setHours(0, 0, 0, 0)),
        lt: new Date(scheduleDate.setHours(24, 0, 0, 0))
      }
    }
  });

  if (scheduleCount >= 5) {
    throw new ApiError(400, 'Maximum 5 schedules per day reached');
  }

  // Create schedule
  const schedule = await prisma.classSchedule.create({
    data: {
      trainerId,
      date: scheduleDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime
    }
  });

  // Send response
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Class schedule created successfully',
    data: schedule
  });
});

// Update schedule
export const updateSchedule = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const validatedData = updateScheduleSchema.parse(req.body);
  const { trainerId } = validatedData;

  // Check if schedule exists
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: Number(id) }
  });

  if (!schedule) {
    throw new ApiError(404, 'Schedule not found');
  }

  // If trainerId is provided, check if trainer exists
  if (trainerId) {
    const trainer = await prisma.user.findFirst({
      where: { 
        id: trainerId,
        role: UserRole.TRAINER 
      }
    });

    if (!trainer) {
      throw new ApiError(404, 'Trainer not found');
    }
  }

  // Update schedule
  const updatedSchedule = await prisma.classSchedule.update({
    where: { id: Number(id) },
    data: {
      trainerId: trainerId || schedule.trainerId
    }
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Schedule updated successfully',
    data: updatedSchedule
  });
});

// Delete schedule
export const deleteSchedule = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if schedule exists
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: Number(id) },
    include: {
      bookings: true
    }
  });

  if (!schedule) {
    throw new ApiError(404, 'Schedule not found');
  }

  // Delete schedule and related bookings
  await prisma.$transaction(async (prisma) => {
    // Delete related bookings first
    await prisma.booking.deleteMany({
      where: { scheduleId: Number(id) }
    });

    // Delete schedule
    await prisma.classSchedule.delete({
      where: { id: Number(id) }
    });
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Schedule deleted successfully',
    data: null
  });
});

// Get all trainers
export const getTrainers = async (req: AuthRequest, res: Response): Promise<void> => {
  const trainers = await prisma.user.findMany({
    where: { role: UserRole.TRAINER },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Trainers fetched successfully',
    data: trainers
  });
};

// Get all schedules (admin view)
export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  const schedules = await prisma.classSchedule.findMany({
    include: {
      trainer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
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
    }
  });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Schedules fetched successfully',
    data: schedules
  });
};