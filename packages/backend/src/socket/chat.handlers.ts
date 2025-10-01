import { Server as SocketServer, Socket } from 'socket.io';
import { prisma } from '../server';
import { CHAT_APPROVED_PHRASES } from '../config/constants';
import { logger } from '../utils/logger';

export function setupChatHandlers(io: SocketServer, socket: Socket) {
  socket.on('chat:message', async ({ roomCode, message }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  username: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      // Check if chat is allowed
      if (!student.allowChat) {
        callback({ success: false, message: 'Chat is disabled by parent' });
        return;
      }

      // Get session
      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
      });

      if (!session) {
        callback({ success: false, message: 'Room not found' });
        return;
      }

      // Moderate message
      const isPreApproved = CHAT_APPROVED_PHRASES.some((phrase) =>
        message.toLowerCase() === phrase.toLowerCase()
      );

      let isFlagged = false;
      let flagReason = null;

      if (!isPreApproved) {
        // Simple profanity filter (in production, use better filtering)
        const profanityWords = ['bad', 'word', 'list']; // Placeholder
        const hasProfanity = profanityWords.some((word) =>
          message.toLowerCase().includes(word)
        );

        if (hasProfanity) {
          isFlagged = true;
          flagReason = 'Inappropriate content';

          // Log for moderation
          await prisma.moderationLog.create({
            data: {
              userId: student.userId,
              action: 'message_blocked',
              reason: 'Profanity detected',
              severity: 'MEDIUM',
              metadata: { message, roomCode },
            },
          });

          callback({ success: false, message: 'Message blocked: inappropriate content' });
          return;
        }
      }

      // Save message
      const chatMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderId: student.id,
          content: message,
          messageType: 'TEXT',
          isPreApproved,
          isFlagged,
          flagReason,
        },
      });

      // Broadcast to room
      io.to(roomCode).emit('chat:message', {
        id: chatMessage.id,
        senderId: student.id,
        senderName: student.user.profile?.displayName,
        content: message,
        createdAt: chatMessage.createdAt,
      });

      callback({ success: true });

      logger.info(`Chat message sent in room ${roomCode} by ${student.id}`);
    } catch (error) {
      logger.error('Error sending chat message:', error);
      callback({ success: false, message: 'Failed to send message' });
    }
  });

  socket.on('chat:emote', async ({ roomCode, emote }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
      });

      if (!session) {
        callback({ success: false, message: 'Room not found' });
        return;
      }

      // Save emote
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderId: student.id,
          content: emote,
          messageType: 'EMOTE',
          isPreApproved: true,
        },
      });

      // Broadcast to room
      io.to(roomCode).emit('chat:emote', {
        senderId: student.id,
        senderName: student.user.profile?.displayName,
        emote,
      });

      callback({ success: true });
    } catch (error) {
      logger.error('Error sending emote:', error);
      callback({ success: false, message: 'Failed to send emote' });
    }
  });
}