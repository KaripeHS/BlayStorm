import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trophy, Star, Gift, Crown, Users, Zap, CheckCircle } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

interface Notification {
  id: string;
  type: 'ACHIEVEMENT_UNLOCKED' | 'LEVEL_UP' | 'REWARD_CLAIMED' | 'QUEST_COMPLETE' | 'GUILD_INVITATION' | 'CHALLENGE_RECEIVED' | 'FRIEND_ACTIVITY' | 'SYSTEM';
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onNavigate?: (url: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT_UNLOCKED': return Trophy;
      case 'LEVEL_UP': return Star;
      case 'REWARD_CLAIMED': return Gift;
      case 'QUEST_COMPLETE': return CheckCircle;
      case 'GUILD_INVITATION': return Users;
      case 'CHALLENGE_RECEIVED': return Zap;
      case 'FRIEND_ACTIVITY': return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT_UNLOCKED': return 'from-yellow-500 to-orange-500';
      case 'LEVEL_UP': return 'from-purple-500 to-pink-500';
      case 'REWARD_CLAIMED': return 'from-green-500 to-blue-500';
      case 'QUEST_COMPLETE': return 'from-blue-500 to-cyan-500';
      case 'GUILD_INVITATION': return 'from-indigo-500 to-purple-500';
      case 'CHALLENGE_RECEIVED': return 'from-red-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      {/* Bell Icon Button */}
      <div className="fixed top-4 right-20 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center"
        >
          <Bell className="w-6 h-6 text-white" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-900"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}

          {/* Pulse Effect */}
          {unreadCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-red-500"
            />
          )}
        </motion.button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-20 right-4 z-50 w-96 max-h-[80vh] bg-gray-900 rounded-2xl shadow-2xl border-2 border-purple-500/50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    filter === 'unread'
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-purple-400 hover:text-purple-300 font-bold"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Bell className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-bold">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                      onNavigate={onNavigate}
                      getIcon={getNotificationIcon}
                      getColor={getNotificationColor}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (url: string) => void;
  getIcon: (type: string) => any;
  getColor: (type: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  getIcon,
  getColor,
}) => {
  const Icon = getIcon(notification.type);
  const colorGradient = getColor(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
        !notification.isRead && 'bg-purple-900/20'
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-white font-bold text-sm">{notification.title}</h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Toast Notification Component (for real-time pop-ups)
interface ToastNotification {
  id: string;
  type: 'success' | 'achievement' | 'reward' | 'level_up';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface NotificationToastProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  React.useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    // Fire confetti for special notifications
    if (toast.type === 'achievement' || toast.type === 'level_up') {
      fireConfetti({ particleCount: 50, spread: 60 });
    }

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'achievement':
        return 'from-yellow-500 to-orange-500';
      case 'level_up':
        return 'from-purple-500 to-pink-500';
      case 'reward':
        return 'from-green-500 to-blue-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      className={`bg-gradient-to-r ${getToastStyles()} rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-md border-2 border-white/20`}
    >
      <div className="flex items-center gap-3">
        {toast.icon && <div className="text-4xl">{toast.icon}</div>}
        <div className="flex-1">
          <h4 className="text-white font-black text-lg mb-1">{toast.title}</h4>
          <p className="text-white/90 text-sm">{toast.message}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Toast Container (manages multiple toasts)
interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;