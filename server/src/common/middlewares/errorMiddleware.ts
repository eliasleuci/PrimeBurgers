import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { logger } from '../utils/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  // Log error for production monitoring
  if (err.statusCode === 500) {
    logger.error(`[InternalServerError]: ${err.message}`, { stack: err.stack });
  }

  // Response for Client
  res.status(err.statusCode).json({
    status: err.statusCode < 500 ? 'fail' : 'error',
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
