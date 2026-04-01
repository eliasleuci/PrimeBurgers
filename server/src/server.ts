import dotenv from 'dotenv';
import app from './app';
import { logger } from './common/utils/logger';

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { message: err.message });
  server.close(() => {
    process.exit(1);
  });
});
