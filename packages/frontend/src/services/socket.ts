import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.io server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Setup base event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen to event from server
   */
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized. Cannot listen to:', event);
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ========================================
  // QUEST EVENTS
  // ========================================

  onQuestProgress(callback: (data: { questId: string; progress: number; target: number }) => void) {
    this.on('quest:progress', callback);
  }

  onQuestCompleted(callback: (data: { questId: string; name: string; rewards: any }) => void) {
    this.on('quest:completed', callback);
  }

  // ========================================
  // LEADERBOARD EVENTS
  // ========================================

  joinLeaderboard(type: string, scope: string) {
    this.emit('leaderboard:join', { type, scope });
  }

  leaveLeaderboard(type: string, scope: string) {
    this.emit('leaderboard:leave', { type, scope });
  }

  onLeaderboardUpdate(callback: (entries: any[]) => void) {
    this.on('leaderboard:update', callback);
  }

  // ========================================
  // BATTLE PASS EVENTS
  // ========================================

  onBattlePassXP(callback: (data: { xp: number; currentXp: number; nextLevel: number }) => void) {
    this.on('battlepass:xp_gained', callback);
  }

  onBattlePassLevelUp(callback: (data: { level: number; rewards: any[] }) => void) {
    this.on('battlepass:level_up', callback);
  }

  // ========================================
  // GUILD CHAT
  // ========================================

  joinGuild(guildId: string) {
    this.emit('join:guild', guildId);
  }

  sendGuildMessage(guildId: string, message: string) {
    this.emit('guild:message', { guildId, message });
  }

  sendGuildTyping(guildId: string, username: string) {
    this.emit('guild:typing', { guildId, username });
  }

  onGuildMessage(callback: (data: { id: string; userId: string; message: string; timestamp: Date }) => void) {
    this.on('guild:message_received', callback);
  }

  onGuildUserTyping(callback: (data: { userId: string; username: string }) => void) {
    this.on('guild:user_typing', callback);
  }

  // ========================================
  // CHALLENGE EVENTS
  // ========================================

  sendChallenge(targetUserId: string, challengeId: string) {
    this.emit('challenge:send', { targetUserId, challengeId });
  }

  acceptChallenge(challengeId: string, opponentId: string) {
    this.emit('challenge:accept', { challengeId, opponentId });
  }

  declineChallenge(challengeId: string, opponentId: string) {
    this.emit('challenge:decline', { challengeId, opponentId });
  }

  onChallengeReceived(callback: (data: { challengeId: string; fromUserId: string }) => void) {
    this.on('challenge:received', callback);
  }

  onChallengeAccepted(callback: (data: { challengeId: string; acceptedBy: string }) => void) {
    this.on('challenge:accepted', callback);
  }

  onChallengeDeclined(callback: (data: { challengeId: string; declinedBy: string }) => void) {
    this.on('challenge:declined', callback);
  }

  onChallengeResult(callback: (data: { challengeId: string; result: 'win' | 'loss' }) => void) {
    this.on('challenge:result', callback);
  }

  // ========================================
  // FRIEND ACTIVITY
  // ========================================

  joinFriends() {
    this.emit('join:friends');
  }

  setOnline() {
    this.emit('user:online');
  }

  sendActivity(type: string, details: any) {
    this.emit('user:activity', { type, details });
  }

  onFriendOnline(callback: (data: { userId: string }) => void) {
    this.on('friend:online', callback);
  }

  onFriendOffline(callback: (data: { userId: string }) => void) {
    this.on('friend:offline', callback);
  }

  onFriendActivity(callback: (data: { userId: string; type: string; details: any; timestamp: Date }) => void) {
    this.on('friend:activity', callback);
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================

  onNotification(callback: (notification: any) => void) {
    this.on('notification:new', callback);
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
