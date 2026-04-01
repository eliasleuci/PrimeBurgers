import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { contextStorage } from '../utils/context';
import { logger } from '../utils/logger';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const startTime = Date.now();

  contextStorage.run({ requestId, startTime }, () => {
    // Add requestId to response headers
    res.setHeader('x-request-id', requestId);

    // Initial request log
    logger.info(`${req.method} ${req.url}`);

    // Capture response finish to log duration
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(`Request completed | method=${req.method} url=${req.url} status=${res.statusCode} durationMs=${duration}`, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        durationMs: duration
      });
    });

    next();
  });
};
