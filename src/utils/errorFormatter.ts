import { ZodError } from 'zod';

interface ErrorMessage {
  field: string;
  message: string;
}

export const formatZodError = (error: ZodError): ErrorMessage[] => {
  return error.errors.map((err) => {
    return {
      field: err.path.join('.'),
      message: err.message
    };
  });
};