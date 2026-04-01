import winston from 'winston';
import { getRequestId } from './context';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    info.requestId = getRequestId();
    return info;
  })(),
  process.env.NODE_ENV === 'production' 
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.requestId}] ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      )
);

const transports = [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});
