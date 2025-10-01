import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import socketService from '../services/socket';

/**
 * Initialize socket connection (use in App.tsx)
 */
export function useSocketConnection() {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        socketService.connect(token);
        setIsConnected(true);

        // Set user as online
        socketService.setOnline();

        return () => {
          socketService.disconnect();
          setIsConnected(false);
        };
      }
    }
  }, [user]);

  return isConnected;
}

/**
 * Listen to quest updates
 */
export function useQuestUpdates(onProgress?: (data: any) => void, onComplete?: (data: any) => void) {
  useEffect(() => {
    if (onProgress) {
      socketService.onQuestProgress(onProgress);
    }

    if (onComplete) {
      socketService.onQuestCompleted(onComplete);
    }

    return () => {
      if (onProgress) socketService.off('quest:progress', onProgress);
      if (onComplete) socketService.off('quest:completed', onComplete);
    };
  }, [onProgress, onComplete]);
}

/**
 * Join leaderboard updates
 */
export function useLeaderboard(type: string, scope: string, onUpdate?: (entries: any[]) => void) {
  useEffect(() => {
    socketService.joinLeaderboard(type, scope);

    if (onUpdate) {
      socketService.onLeaderboardUpdate(onUpdate);
    }

    return () => {
      socketService.leaveLeaderboard(type, scope);
      if (onUpdate) socketService.off('leaderboard:update', onUpdate);
    };
  }, [type, scope, onUpdate]);
}

/**
 * Listen to Battle Pass updates
 */
export function useBattlePassUpdates(onXP?: (data: any) => void, onLevelUp?: (data: any) => void) {
  useEffect(() => {
    if (onXP) {
      socketService.onBattlePassXP(onXP);
    }

    if (onLevelUp) {
      socketService.onBattlePassLevelUp(onLevelUp);
    }

    return () => {
      if (onXP) socketService.off('battlepass:xp_gained', onXP);
      if (onLevelUp) socketService.off('battlepass:level_up', onLevelUp);
    };
  }, [onXP, onLevelUp]);
}

/**
 * Guild chat hook
 */
export function useGuildChat(guildId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!guildId) return;

    // Join guild room
    socketService.joinGuild(guildId);

    // Listen to messages
    const handleMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleTyping = (data: { userId: string; username: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 3000);
    };

    socketService.onGuildMessage(handleMessage);
    socketService.onGuildUserTyping(handleTyping);

    return () => {
      socketService.off('guild:message_received', handleMessage);
      socketService.off('guild:user_typing', handleTyping);
    };
  }, [guildId]);

  const sendMessage = (message: string) => {
    if (guildId) {
      socketService.sendGuildMessage(guildId, message);
    }
  };

  const sendTyping = (username: string) => {
    if (guildId) {
      socketService.sendGuildTyping(guildId, username);
    }
  };

  return { messages, typingUsers, sendMessage, sendTyping };
}

/**
 * Challenge notifications hook
 */
export function useChallengeNotifications() {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    const handleReceived = (data: any) => {
      setChallenges((prev) => [...prev, { ...data, type: 'received' }]);
    };

    const handleAccepted = (data: any) => {
      setChallenges((prev) => [...prev, { ...data, type: 'accepted' }]);
    };

    const handleDeclined = (data: any) => {
      setChallenges((prev) => [...prev, { ...data, type: 'declined' }]);
    };

    const handleResult = (data: any) => {
      setChallenges((prev) => [...prev, { ...data, type: 'result' }]);
    };

    socketService.onChallengeReceived(handleReceived);
    socketService.onChallengeAccepted(handleAccepted);
    socketService.onChallengeDeclined(handleDeclined);
    socketService.onChallengeResult(handleResult);

    return () => {
      socketService.off('challenge:received', handleReceived);
      socketService.off('challenge:accepted', handleAccepted);
      socketService.off('challenge:declined', handleDeclined);
      socketService.off('challenge:result', handleResult);
    };
  }, []);

  const acceptChallenge = (challengeId: string, opponentId: string) => {
    socketService.acceptChallenge(challengeId, opponentId);
  };

  const declineChallenge = (challengeId: string, opponentId: string) => {
    socketService.declineChallenge(challengeId, opponentId);
  };

  return { challenges, acceptChallenge, declineChallenge };
}

/**
 * Friend activity feed hook
 */
export function useFriendActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Join friends room
    socketService.joinFriends();

    const handleOnline = (data: { userId: string }) => {
      setOnlineFriends((prev) => new Set(prev).add(data.userId));
    };

    const handleOffline = (data: { userId: string }) => {
      setOnlineFriends((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleActivity = (data: any) => {
      setActivities((prev) => [data, ...prev].slice(0, 50)); // Keep last 50
    };

    socketService.onFriendOnline(handleOnline);
    socketService.onFriendOffline(handleOffline);
    socketService.onFriendActivity(handleActivity);

    return () => {
      socketService.off('friend:online', handleOnline);
      socketService.off('friend:offline', handleOffline);
      socketService.off('friend:activity', handleActivity);
    };
  }, []);

  return { activities, onlineFriends: Array.from(onlineFriends) };
}

/**
 * Generic notification listener
 */
export function useNotifications(onNotification?: (notification: any) => void) {
  useEffect(() => {
    if (onNotification) {
      socketService.onNotification(onNotification);
    }

    return () => {
      if (onNotification) socketService.off('notification:new', onNotification);
    };
  }, [onNotification]);
}
