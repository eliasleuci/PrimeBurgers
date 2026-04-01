import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../exceptions/AppError';
import { prisma } from '../../config/database';

interface JwtPayload {
  id: string;
  role: string;
  branchId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No authenticated user', 0x191));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    // Optional: Check if user still exists and isActive
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      return next(new AppError('The user no longer exists or is inactive', 0x191));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid token', 0x191));
  }
};
