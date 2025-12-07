import { Server as SocketServer, Socket } from 'socket.io';
import { prisma } from '../server';
import { generateRoomCode } from '../utils/helpers';
import { logger } from '../utils/logger';

interface RoomData {
  mode: string;
  maxPlayers: number;
  difficulty: number;
  problemCount: number;
}

export function setupMultiplayerHandlers(io: SocketServer, socket: Socket) {
  // Create room
  socket.on('room:create', async (data: RoomData, callback) => {
    try {
      const { mode, maxPlayers, difficulty, problemCount } = data;
      const userId = socket.handshake.auth.userId;

      // Get student profile
      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      // Generate unique room code
      let roomCode = generateRoomCode();
      let existing = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
      });

      while (existing) {
        roomCode = generateRoomCode();
        existing = await prisma.multiplayerSession.findUnique({
          where: { roomCode },
        });
      }

      // Create room
      const session = await prisma.multiplayerSession.create({
        data: {
          roomCode,
          mode: mode as any,
          status: 'WAITING',
          maxPlayers,
          difficulty,
          problemCount,
          hostId: student.id,
          players: {
            create: {
              studentId: student.id,
              isHost: true,
              isReady: false,
            },
          },
        },
        include: {
          players: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      profile: {
                        select: {
                          username: true,
                          displayName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Join socket room
      socket.join(roomCode);

      callback({ success: true, data: session });

      logger.info(`Room created: ${roomCode} by ${student.id}`);
    } catch (error) {
      logger.error('Error creating room:', error);
      callback({ success: false, message: 'Failed to create room' });
    }
  });

  // Join room
  socket.on('room:join', async ({ roomCode }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      // Find room
      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: {
          players: true,
        },
      });

      if (!session) {
        callback({ success: false, message: 'Room not found' });
        return;
      }

      if (session.status !== 'WAITING') {
        callback({ success: false, message: 'Game already started' });
        return;
      }

      if (session.players.length >= session.maxPlayers) {
        callback({ success: false, message: 'Room is full' });
        return;
      }

      // Check if already in room
      const existingPlayer = session.players.find((p) => p.studentId === student.id);
      if (existingPlayer) {
        socket.join(roomCode);
        callback({ success: true, data: session });
        return;
      }

      // Add player
      await prisma.multiplayerPlayer.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          isHost: false,
          isReady: false,
        },
      });

      // Join socket room
      socket.join(roomCode);

      // Get updated session
      const updatedSession = await prisma.multiplayerSession.findUnique({
        where: { id: session.id },
        include: {
          players: {
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      profile: {
                        select: {
                          username: true,
                          displayName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Notify all players in room
      io.to(roomCode).emit('room:player-joined', updatedSession);

      callback({ success: true, data: updatedSession });

      logger.info(`Player ${student.id} joined room ${roomCode}`);
    } catch (error) {
      logger.error('Error joining room:', error);
      callback({ success: false, message: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('room:leave', async ({ roomCode }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!student) {
        callback?.({ success: false, message: 'Student not found' });
        return;
      }

      // Find player
      const player = await prisma.multiplayerPlayer.findFirst({
        where: {
          session: { roomCode },
          studentId: student.id,
        },
        include: { session: true },
      });

      if (!player) {
        callback?.({ success: false, message: 'Not in room' });
        return;
      }

      // Remove player
      await prisma.multiplayerPlayer.delete({
        where: { id: player.id },
      });

      // Leave socket room
      socket.leave(roomCode);

      // Check if room is now empty
      const remainingPlayers = await prisma.multiplayerPlayer.count({
        where: { sessionId: player.sessionId },
      });

      if (remainingPlayers === 0) {
        // Delete empty room
        await prisma.multiplayerSession.delete({
          where: { id: player.sessionId },
        });
      } else {
        // Notify remaining players
        io.to(roomCode).emit('room:player-left', {
          studentId: student.id,
          remainingPlayers,
        });
      }

      callback?.({ success: true });

      logger.info(`Player ${student.id} left room ${roomCode}`);
    } catch (error) {
      logger.error('Error leaving room:', error);
      callback?.({ success: false, message: 'Failed to leave room' });
    }
  });

  // Ready toggle
  socket.on('room:ready', async ({ roomCode, isReady }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      // Update player ready status
      await prisma.multiplayerPlayer.updateMany({
        where: {
          session: { roomCode },
          studentId: student.id,
        },
        data: {
          isReady,
        },
      });

      // Get updated session
      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
        include: {
          players: true,
        },
      });

      // Notify all players
      io.to(roomCode).emit('room:player-ready', {
        studentId: student.id,
        isReady,
      });

      // Check if all players are ready
      const allReady = session!.players.every((p) => p.isReady);

      if (allReady && session!.players.length >= 2) {
        // Start game
        await prisma.multiplayerSession.update({
          where: { id: session!.id },
          data: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
        });

        io.to(roomCode).emit('game:start', {
          sessionId: session!.id,
        });
      }

      callback({ success: true });
    } catch (error) {
      logger.error('Error toggling ready:', error);
      callback({ success: false, message: 'Failed to update ready status' });
    }
  });

  // Submit answer in multiplayer
  socket.on('game:submit-answer', async ({ roomCode, problemId, answer, timeSpent }, callback) => {
    try {
      const userId = socket.handshake.auth.userId;

      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (!student) {
        callback({ success: false, message: 'Student not found' });
        return;
      }

      // Get the problem to check the answer
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      });

      if (!problem) {
        callback({ success: false, message: 'Problem not found' });
        return;
      }

      // Normalize and compare answers
      const normalizeAnswer = (ans: string) => ans.toString().trim().toLowerCase().replace(/\s+/g, '');
      const isCorrect = normalizeAnswer(answer) === normalizeAnswer(problem.answer);

      // Calculate points based on correctness, time, and difficulty
      let pointsEarned = 0;
      if (isCorrect) {
        const basePoints = 100;
        const difficultyMultiplier = 1 + (problem.difficulty - 1) * 0.25; // 1.0 to 2.0
        const timeBonus = Math.max(0, 30 - Math.floor(timeSpent / 1000)) * 2; // Up to 60 bonus points for fast answers
        pointsEarned = Math.round(basePoints * difficultyMultiplier + timeBonus);
      }

      // Update player score
      await prisma.multiplayerPlayer.updateMany({
        where: {
          session: { roomCode },
          studentId: student.id,
        },
        data: {
          score: { increment: pointsEarned },
          problemsSolved: { increment: isCorrect ? 1 : 0 },
        },
      });

      // Get session to check mode for team scoring
      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
      });

      // Update team score for cooperative modes
      if (session && ['COOP_QUEST', 'TEAM_VS_TEAM'].includes(session.mode)) {
        await prisma.multiplayerSession.update({
          where: { roomCode },
          data: { teamScore: { increment: pointsEarned } },
        });
      }

      // Get updated leaderboard for the room
      const players = await prisma.multiplayerPlayer.findMany({
        where: { session: { roomCode } },
        orderBy: { score: 'desc' },
        include: {
          student: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
      });

      const leaderboard = players.map((p, index) => ({
        rank: index + 1,
        studentId: p.studentId,
        displayName: p.student.user.profile?.displayName || 'Unknown',
        score: p.score,
        problemsSolved: p.problemsSolved,
      }));

      // Notify all players with updated leaderboard
      io.to(roomCode).emit('game:player-answered', {
        studentId: student.id,
        isCorrect,
        pointsEarned,
        timeSpent,
        leaderboard,
      });

      callback({ success: true, isCorrect, pointsEarned, correctAnswer: isCorrect ? null : problem.answer });
    } catch (error) {
      logger.error('Error submitting answer:', error);
      callback({ success: false, message: 'Failed to submit answer' });
    }
  });

  // End game
  socket.on('game:end', async ({ roomCode }, callback) => {
    try {
      await prisma.multiplayerSession.updateMany({
        where: { roomCode },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
        },
      });

      // Get final scores
      const session = await prisma.multiplayerSession.findUnique({
        where: { roomCode },
        include: {
          players: {
            orderBy: { score: 'desc' },
            include: {
              student: {
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
              },
            },
          },
        },
      });

      io.to(roomCode).emit('game:end', session);

      callback({ success: true, data: session });
    } catch (error) {
      logger.error('Error ending game:', error);
      callback({ success: false, message: 'Failed to end game' });
    }
  });
}