import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { formatZodError } from '../utils/errorFormatter';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails = [];

  // Handle different types of errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ? err.errorDetails : [{ field: '', message }];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error occurred';
    errorDetails = formatZodError(err);
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorDetails = [{ field: '', message }];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorDetails = [{ field: '', message }];
  } else {
    // For unknown errors, log them but don't expose details
    console.error('Unknown error:', err);
    errorDetails = [{ field: '', message }];
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails
  });
};