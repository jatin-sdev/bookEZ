import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Log the error
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // 2. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.issues,
    });
    return;
  }

  // 3. Handle Custom App Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // 4. Handle Default/Unknown Errors (Fail Safe)
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
