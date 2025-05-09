import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

// Generate JWT token
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new ApiError(500, 'JWT secret is not defined');
  }
  const options: SignOptions = {
    expiresIn: '7d',
  };
  const token = jwt.sign(payload, secret, options);

  return token;
};

// Verify JWT token
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new ApiError(500, 'JWT secret is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};