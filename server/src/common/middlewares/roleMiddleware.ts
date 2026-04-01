import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Permission denied', 0x193));
    }
    next();
  };
};
