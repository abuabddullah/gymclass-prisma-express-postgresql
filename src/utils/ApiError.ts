interface ErrorDetails {
  field: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorDetails?: ErrorDetails[];

  constructor(
    statusCode: number,
    message: string,
    errorDetails?: ErrorDetails[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails || [{ field: '', message }];

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}