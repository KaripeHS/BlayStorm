import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Star, Gift, CheckCircle, Lock } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

interface Quest {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  targetValue: number;
  currentProgress: number;
  coinReward: number;
  xpReward: number;
  gemReward: number;
  completedAt?: Date;
  claimedAt?: Date;
  expiresAt: Date;
}

interface DailyQuestsProps {
  quests: Quest[];
  onClaimReward: (questId: string) => Promise<void>;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({ quests, onClaimReward }) => {
  const [expanded, setExpanded] = useState(true);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);

  const completedQuests = quests.filter((q) => q.completedAt && !q.claimedAt).length;
  const totalQuests = quests.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-400 bg-green-400/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'HARD':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleClaimReward = async (questId: string) => {
    setClaimingQuestId(questId);
    try {
      await onClaimReward(questId);
      fireConfetti({ particleCount: 100, spread: 90 });
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingQuestId(null);
    }
  };

  return (
    <div className="fixed left-4 top-20 z-40 max-w-md">
      {/* Collapsed View */}
      <AnimatePresence>
        {!expanded && (
          <motion.button
            initial={{ scale: 0, x: -100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: -100 }}
            onClick={() => setExpanded(true)}
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-sm font-bold text-white">Daily Quests</div>
                {completedQuests > 0 && (
                  <div className="text-xs text-yellow-400">
                    {completedQuests} ready to claim!
                  </div>
                )}
              </div>
              {completedQuests > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-3 h-3 bg-yellow-400 rounded-full"
                />
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded View */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ scale: 0, x: -100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: -100 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-2 border-purple-500/50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Daily Quests</h3>
                    <div className="text-xs text-gray-200">
                      {totalQuests - completedQuests} / {totalQuests} Active
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-200 mb-1">
                  <span>Progress</span>
                  <span>
                    {quests.filter((q) => q.claimedAt).length} / {totalQuests}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (quests.filter((q) => q.claimedAt).length / totalQuests) * 100
                      }%`,
                    }}
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Quest List */}
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaimReward={() => handleClaimReward(quest.id)}
                  isClaiming={claimingQuestId === quest.id}
                  getDifficultyColor={getDifficultyColor}
                  getTimeRemaining={getTimeRemaining}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface QuestCardProps {
  quest: Quest;
  onClaimReward: () => void;
  isClaiming: boolean;
  getDifficultyColor: (difficulty: string) => string;
  getTimeRemaining: (expiresAt: Date) => string;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onClaimReward,
  isClaiming,
  getDifficultyColor,
  getTimeRemaining,
}) => {
  const progress = Math.min((quest.currentProgress / quest.targetValue) * 100, 100);
  const isCompleted = quest.completedAt && !quest.claimedAt;
  const isClaimed = quest.claimedAt;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 transition-all ${
        isClaimed
          ? 'bg-gray-800/50 border-2 border-gray-700'
          : isCompleted
          ? 'bg-gradient-to-br from-green-600/20 to-blue-600/20 border-2 border-green-500'
          : 'bg-gray-800 border-2 border-gray-700 hover:border-purple-500'
      }`}
    >
      {/* Quest Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white">{quest.name}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(
                quest.difficulty
              )}`}
            >
              {quest.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-400">{quest.description}</p>
        </div>

        {/* Status Icon */}
        <div className="ml-2">
          {isClaimed ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : isCompleted ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ) : (
            <Lock className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isClaimed && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {quest.currentProgress} / {quest.targetValue}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-blue-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {quest.coinReward > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="text-lg">🪙</span>
              <span className="font-bold">{quest.coinReward}</span>
            </div>
          )}
          {quest.xpReward > 0 && (
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-4 h-4" />
              <span className="font-bold">{quest.xpReward}</span>
            </div>
          )}
          {quest.gemReward > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <span className="text-lg">💎</span>
              <span className="font-bold">{quest.gemReward}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isCompleted && !isClaimed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClaimReward}
            disabled={isClaiming}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isClaiming ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>Claim</span>
              </>
            )}
          </motion.button>
        )}

        {/* Time Remaining */}
        {!isClaimed && !isCompleted && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{getTimeRemaining(quest.expiresAt)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyQuests;