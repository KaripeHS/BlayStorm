import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, Users, Medal, Crown, TrendingUp, Award } from 'lucide-react';

type LeaderboardType = 'XP' | 'PROBLEMS_SOLVED' | 'STREAK' | 'ACCURACY' | 'COMBO' | 'SPEED';
type LeaderboardScope = 'GLOBAL' | 'SCHOOL' | 'CLASS' | 'GRADE' | 'FRIENDS';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  level?: number;
  schoolName?: string;
  className?: string;
  change?: number; // Position change from last period (+2, -1, etc.)
}

interface LeaderboardsProps {
  currentStudentId: string;
  currentStudentRank: number;
  leaderboards: {
    XP: LeaderboardEntry[];
    PROBLEMS_SOLVED: LeaderboardEntry[];
    STREAK: LeaderboardEntry[];
    ACCURACY: LeaderboardEntry[];
    COMBO: LeaderboardEntry[];
    SPEED: LeaderboardEntry[];
  };
  scope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
  onRefresh?: () => void;
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({
  currentStudentId,
  currentStudentRank,
  leaderboards,
  scope,
  onScopeChange,
  onRefresh,
}) => {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('XP');

  const types: Array<{ id: LeaderboardType; label: string; icon: any; color: string }> = [
    { id: 'XP', label: 'Total XP', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { id: 'PROBLEMS_SOLVED', label: 'Problems Solved', icon: Target, color: 'from-green-500 to-blue-500' },
    { id: 'STREAK', label: 'Best Streak', icon: Zap, color: 'from-orange-500 to-red-500' },
    { id: 'ACCURACY', label: 'Accuracy', icon: Trophy, color: 'from-purple-500 to-pink-500' },
    { id: 'COMBO', label: 'Max Combo', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { id: 'SPEED', label: 'Speed Runner', icon: Zap, color: 'from-red-500 to-yellow-500' },
  ];

  const scopes: Array<{ id: LeaderboardScope; label: string; icon: any }> = [
    { id: 'GLOBAL', label: 'Global', icon: Trophy },
    { id: 'SCHOOL', label: 'My School', icon: Users },
    { id: 'CLASS', label: 'My Class', icon: Users },
    { id: 'GRADE', label: 'My Grade', icon: Users },
    { id: 'FRIENDS', label: 'Friends', icon: Users },
  ];

  const currentLeaderboard = leaderboards[selectedType] || [];
  const top3 = currentLeaderboard.slice(0, 3);
  const rest = currentLeaderboard.slice(3, 20); // Show up to rank 20

  const currentType = types.find(t => t.id === selectedType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            Leaderboards
          </h1>
          <p className="text-gray-400 text-lg">Compete with the best math champions!</p>
        </motion.div>

        {/* Scope Filters */}
        <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
          {scopes.map((scopeOption) => {
            const Icon = scopeOption.icon;
            return (
              <motion.button
                key={scopeOption.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onScopeChange(scopeOption.id)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  scope === scopeOption.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {scopeOption.label}
              </motion.button>
            );
          })}
        </div>

        {/* Type Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {types.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  selectedType === type.id
                    ? `bg-gradient-to-r ${type.color} text-white shadow-2xl`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-xs">{type.label}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Current Student Rank Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-2xl p-6 mb-8 border-2 border-purple-500/50 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-2xl">
                #{currentStudentRank}
              </div>
              <div>
                <p className="text-gray-300 text-sm">Your Rank</p>
                <p className="text-white font-bold text-xl">You're doing great!</p>
              </div>
            </div>
            {onRefresh && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRefresh}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <TrendingUp className="w-6 h-6" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <PodiumCard
                entry={top3[1]}
                rank={2}
                currentStudentId={currentStudentId}
                type={selectedType}
                height="h-48"
                color="from-gray-400 to-gray-500"
              />

              {/* 1st Place */}
              <PodiumCard
                entry={top3[0]}
                rank={1}
                currentStudentId={currentStudentId}
                type={selectedType}
                height="h-64"
                color="from-yellow-400 to-orange-500"
              />

              {/* 3rd Place */}
              <PodiumCard
                entry={top3[2]}
                rank={3}
                currentStudentId={currentStudentId}
                type={selectedType}
                height="h-40"
                color="from-orange-400 to-orange-600"
              />
            </div>
          </motion.div>
        )}

        {/* Rest of Rankings */}
        <div className="space-y-2">
          <AnimatePresence>
            {rest.map((entry, index) => (
              <RankCard
                key={entry.studentId}
                entry={entry}
                currentStudentId={currentStudentId}
                type={selectedType}
                delay={index * 0.05}
              />
            ))}
          </AnimatePresence>
        </div>

        {currentLeaderboard.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">No rankings yet</p>
            <p className="text-sm">Be the first to claim the top spot!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: number;
  currentStudentId: string;
  type: LeaderboardType;
  height: string;
  color: string;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  entry,
  rank,
  currentStudentId,
  type,
  height,
  color,
}) => {
  const isCurrentUser = entry.studentId === currentStudentId;

  const getCrownIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getScoreLabel = (type: LeaderboardType, score: number) => {
    if (type === 'ACCURACY') return `${score.toFixed(1)}%`;
    if (type === 'SPEED') return `${score.toFixed(1)}s avg`;
    return score.toLocaleString();
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: rank * 0.1 }}
      className="flex flex-col items-center"
    >
      {/* Character/Avatar */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: rank * 0.2 }}
        className={`relative mb-4 ${isCurrentUser && 'ring-4 ring-green-400 rounded-full'}`}
      >
        <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-4xl shadow-2xl`}>
          {entry.avatarUrl || '🧑'}
        </div>

        {/* Crown */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">
          {getCrownIcon(rank)}
        </div>

        {/* Rank Badge */}
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-gray-900`}>
          #{rank}
        </div>
      </motion.div>

      {/* Username */}
      <div className="text-white font-bold text-lg mb-1 max-w-[120px] truncate">
        {entry.username}
      </div>

      {/* Level Badge */}
      {entry.level && (
        <div className="text-xs text-gray-400 mb-2">Level {entry.level}</div>
      )}

      {/* Score */}
      <div className="text-yellow-400 font-black text-2xl mb-4">
        {getScoreLabel(type, entry.score)}
      </div>

      {/* Podium */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ delay: rank * 0.1 + 0.3, duration: 0.5 }}
        className={`w-32 ${height} bg-gradient-to-br ${color} rounded-t-xl flex items-center justify-center text-white font-black text-6xl opacity-50`}
      >
        {rank}
      </motion.div>
    </motion.div>
  );
};

interface RankCardProps {
  entry: LeaderboardEntry;
  currentStudentId: string;
  type: LeaderboardType;
  delay: number;
}

const RankCard: React.FC<RankCardProps> = ({ entry, currentStudentId, type, delay }) => {
  const isCurrentUser = entry.studentId === currentStudentId;

  const getScoreLabel = (type: LeaderboardType, score: number) => {
    if (type === 'ACCURACY') return `${score.toFixed(1)}%`;
    if (type === 'SPEED') return `${score.toFixed(1)}s avg`;
    return score.toLocaleString();
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    return null;
  };

  const getChangeText = (change?: number) => {
    if (!change) return null;
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`p-4 rounded-xl transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-green-800 to-green-900 border-2 border-green-500'
          : 'bg-gray-800 hover:bg-gray-750'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
          isCurrentUser
            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
            : 'bg-gray-700 text-gray-400'
        }`}>
          #{entry.rank}
        </div>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl ${
          isCurrentUser && 'ring-2 ring-green-400'
        }`}>
          {entry.avatarUrl || '🧑'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold truncate ${isCurrentUser ? 'text-green-200' : 'text-white'}`}>
              {entry.username}
              {isCurrentUser && <span className="text-xs ml-2">(You)</span>}
            </h3>
            {entry.level && (
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                Lvl {entry.level}
              </span>
            )}
          </div>
          {(entry.schoolName || entry.className) && (
            <p className="text-xs text-gray-500 truncate">
              {[entry.schoolName, entry.className].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        {/* Change Indicator */}
        {entry.change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            entry.change > 0 ? 'bg-green-900/50 text-green-400' :
            entry.change < 0 ? 'bg-red-900/50 text-red-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            {getChangeIcon(entry.change)}
            <span className="text-xs font-bold">{getChangeText(entry.change)}</span>
          </div>
        )}

        {/* Score */}
        <div className={`text-right font-black text-xl ${
          isCurrentUser ? 'text-green-200' : 'text-yellow-400'
        }`}>
          {getScoreLabel(type, entry.score)}
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboards;