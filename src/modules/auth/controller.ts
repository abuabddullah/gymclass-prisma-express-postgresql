import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { generateToken } from '../../config/jwt';
import { loginSchema, registerSchema } from '../../utils/validator';
import { catchAsyncErrorsMiddleware } from '../../middleware/catchAsyncErrorsMiddleware';

// Register user
export const register = catchAsyncErrorsMiddleware(async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);
  const { name, email, password, role } = validatedData;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(400, 'Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with TRAINEE role only (ADMIN and TRAINER roles are created by admin)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.TRAINEE // Only allow TRAINEE registration through this endpoint
    }
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Send response
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
});

// Login user
export const login = catchAsyncErrorsMiddleware(async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Send response
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Login successful',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
});