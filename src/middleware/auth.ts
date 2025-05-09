import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/db';

// Define extended request interface with user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized access');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Unauthorized access');
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      throw new ApiError(401, 'Unauthorized access');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized access');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden access');
    }
    
    next();
  };
};