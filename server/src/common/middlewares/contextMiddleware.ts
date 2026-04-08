import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { contextStorage } from '../utils/context';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const startTime = Date.now();

  contextStorage.run({ requestId, startTime }, () => {
    res.setHeader('x-request-id', requestId);
    next();
  });
};