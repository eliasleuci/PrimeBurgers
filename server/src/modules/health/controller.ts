import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';

export class HealthController {
  async getStatus(req: Request, res: Response) {
    const status = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    };
    res.status(200).json(status);
  }

  async getDbStatus(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      // Real latency check with a trivial query
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;

      res.status(200).json({
        status: 'CONNECTED',
        latencyMs: latency,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Database health check FAILED', { error: error.message });
      res.status(503).json({
        status: 'DISCONNECTED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}
