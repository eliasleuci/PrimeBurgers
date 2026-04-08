import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppError } from '../exceptions/AppError';
import { getContext } from '../utils/context';
import { logger } from '../utils/logger';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('No authenticated user', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const store = getContext();

    if (store) {
      store.tenantId = decoded.tenantId;
      store.userId = decoded.id;
    }

    logger.info(`${req.method} ${req.url} | tenantId=${decoded.tenantId}`);

    res.on('finish', () => {
      if (store) {
        const duration = Date.now() - store.startTime;
        logger.info(`Request completed | method=${req.method} url=${req.url} status=${res.statusCode} durationMs=${duration}`);
      }
    });

    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid token', 401));
  }
};