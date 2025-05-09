import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { updateProfileSchema, createBookingSchema } from '../../utils/validator';
import { catchAsyncErrorsMiddleware } from '../../middleware/catchAsyncErrorsMiddleware';

// Update trainee profile
export const updateProfile = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  // Validate request body
  const validatedData = updateProfileSchema.parse(req.body);
  const { name, email, password } = validatedData;

  // Prepare update data
  const updateData: any = {};
  
  if (name) updateData.name = name;
  
  // Check if email is being updated and if it's already in use
  if (email && email !== req.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    updateData.email = email;
  }

  // Hash password if provided
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// Book a class
export const createBooking = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  // Validate request body
  const validatedData = createBookingSchema.parse(req.body);
  const { scheduleId } = validatedData;
  const traineeId = req.user.id;

  // Check if schedule exists
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId }
  });

  if (!schedule) {
    throw new ApiError(404, 'Schedule not found');
  }

  // Check if trainee already booked this schedule
  const existingBooking = await prisma.booking.findFirst({
    where: {
      traineeId,
      scheduleId
    }
  });

  if (existingBooking) {
    throw new ApiError(400, 'You have already booked this class');
  }

  // Check if class is full (max 10 trainees)
  if (schedule.traineeCount >= 10) {
    throw new ApiError(400, 'Class schedule is full. Maximum 10 trainees allowed');
  }

  // Check for overlapping schedules
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      traineeId
    },
    include: {
      schedule: true
    }
  });

  // Check for time conflicts
  for (const booking of overlappingBookings) {
    if (
      (schedule.startTime <= booking.schedule.endTime) && 
      (schedule.endTime >= booking.schedule.startTime)
    ) {
      throw new ApiError(400, 'You have another class scheduled during this time');
    }
  }

  // Create booking and update trainee count in a transaction
  const booking = await prisma.$transaction(async (prisma) => {
    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        traineeId,
        scheduleId
      }
    });

    // Update trainee count
    await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: {
        traineeCount: {
          increment: 1
        }
      }
    });

    return newBooking;
  });

  // Send response
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Class booked successfully',
    data: booking
  });
});

// Cancel booking
export const cancelBooking = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const { id } = req.params;
  const traineeId = req.user.id;

  // Check if booking exists and belongs to the trainee
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(id),
      traineeId
    }
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Delete booking and update trainee count in a transaction
  await prisma.$transaction(async (prisma) => {
    // Delete booking
    await prisma.booking.delete({
      where: { id: Number(id) }
    });

    // Update trainee count
    await prisma.classSchedule.update({
      where: { id: booking.scheduleId },
      data: {
        traineeCount: {
          decrement: 1
        }
      }
    });
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Booking cancelled successfully',
    data: null
  });
});

// Get available schedules
export const getAvailableSchedules = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  // Get all schedules that are not full
  const schedules = await prisma.classSchedule.findMany({
    where: {
      traineeCount: {
        lt: 10
      },
      date: {
        gte: new Date() // Only future schedules
      }
    },
    include: {
      trainer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Available schedules fetched successfully',
    data: schedules
  });
});

// Get trainee bookings
export const getTraineeBookings = catchAsyncErrorsMiddleware(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const traineeId = req.user.id;

  // Get trainee bookings
  const bookings = await prisma.booking.findMany({
    where: { traineeId },
    include: {
      schedule: {
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Trainee bookings fetched successfully',
    data: bookings
  });
});