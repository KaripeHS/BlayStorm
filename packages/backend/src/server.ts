import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { setupSocketHandlers } from './socket';
import { logger } from './utils/logger';

config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

export const prisma = new PrismaClient();
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorMiddleware);

// Setup Socket.io
setupSocketHandlers(io);

// Start server
async function start() {
  try {
    // Connect to Redis
    await redisClient.connect();
    logger.info('✅ Connected to Redis');

    // Test database connection
    await prisma.$connect();
    logger.info('✅ Connected to PostgreSQL');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🔥 BlayStorm API running on port ${PORT}`);
      logger.info(`📡 Socket.io enabled`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  await redisClient.quit();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

start();

export { io };