import { Server as SocketServer } from 'socket.io';
import { setupMultiplayerHandlers } from './multiplayer.handlers';
import { setupChatHandlers } from './chat.handlers';
import { setupEngagementHandlers } from './engagement.handlers';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

export function setupSocketHandlers(io: SocketServer) {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Authenticate socket
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn(`Socket ${socket.id} attempted to connect without token`);
      socket.disconnect();
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      (socket as any).userId = decoded.userId;
      logger.info(`Socket ${socket.id} authenticated for user: ${decoded.userId}`);
    } catch (error) {
      logger.error(`Socket ${socket.id} authentication failed:`, error);
      socket.disconnect();
      return;
    }

    // Setup handlers
    setupMultiplayerHandlers(io, socket);
    setupChatHandlers(io, socket);
    setupEngagementHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io handlers initialized');
}

// Export emit helpers
export * from './engagement.handlers';