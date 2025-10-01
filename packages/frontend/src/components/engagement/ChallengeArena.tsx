import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Target, Zap, Clock, Star, Crown, X, Check } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DECLINED';

interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerLevel: number;
  challengerAvatar?: string;
  opponentId: string;
  opponentName: string;
  opponentLevel: number;
  opponentAvatar?: string;
  status: ChallengeStatus;
  topic: string;
  problemCount: number;
  timeLimit: number; // seconds per problem
  wagerCoins: number;
  wagerGems: number;
  createdAt: Date;
  expiresAt: Date;
  // Scores (null if not completed)
  challengerScore?: number;
  opponentScore?: number;
  challengerAccuracy?: number;
  opponentAccuracy?: number;
  challengerTime?: number;
  opponentTime?: number;
  winnerId?: string;
}

interface ChallengeArenaProps {
  currentStudentId: string;
  currentStudentName: string;
  currentStudentLevel: number;
  currentStudentAvatar?: string;
  currentStudentCoins: number;
  currentStudentGems: number;
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  pendingChallenges: Challenge[]; // Challenges sent to you
  onCreateChallenge?: (opponentId: string, options: {
    topic: string;
    problemCount: number;
    timeLimit: number;
    wagerCoins: number;
    wagerGems: number;
  }) => Promise<void>;
  onAcceptChallenge: (challengeId: string) => Promise<void>;
  onDeclineChallenge: (challengeId: string) => Promise<void>;
  onStartChallenge: (challengeId: string) => void;
  onSearchOpponents?: () => void;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  currentStudentId,
  currentStudentName,
  currentStudentLevel,
  currentStudentAvatar,
  currentStudentCoins,
  currentStudentGems,
  activeChallenges,
  completedChallenges,
  pendingChallenges,
  onCreateChallenge,
  onAcceptChallenge,
  onDeclineChallenge,
  onStartChallenge,
  onSearchOpponents,
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'pending' | 'history'>('active');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const tabs = [
    { id: 'active' as const, label: 'Active', count: activeChallenges.length },
    { id: 'pending' as const, label: 'Pending', count: pendingChallenges.length },
    { id: 'history' as const, label: 'History', count: completedChallenges.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-4">
            Challenge Arena
          </h1>
          <p className="text-gray-400 text-lg mb-6">Battle other students and prove you're the best!</p>

          {/* Action Button */}
          {onSearchOpponents && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSearchOpponents}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xl rounded-xl shadow-2xl"
            >
              <Swords className="w-6 h-6 inline mr-2" />
              Find Opponent
            </motion.button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Wins"
            value={completedChallenges.filter(c => c.winnerId === currentStudentId).length.toString()}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Total Battles"
            value={completedChallenges.length.toString()}
            color="from-blue-500 to-purple-500"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Win Rate"
            value={`${completedChallenges.length > 0 ? Math.round((completedChallenges.filter(c => c.winnerId === currentStudentId).length / completedChallenges.length) * 100) : 0}%`}
            color="from-green-500 to-blue-500"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Level"
            value={currentStudentLevel.toString()}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'active' && (
            <ActiveChallengesTab
              key="active"
              challenges={activeChallenges}
              currentStudentId={currentStudentId}
              onStartChallenge={onStartChallenge}
              onViewDetails={setSelectedChallenge}
            />
          )}
          {selectedTab === 'pending' && (
            <PendingChallengesTab
              key="pending"
              challenges={pendingChallenges}
              currentStudentId={currentStudentId}
              onAccept={onAcceptChallenge}
              onDecline={onDeclineChallenge}
              onViewDetails={setSelectedChallenge}
            />
          )}
          {selectedTab === 'history' && (
            <HistoryTab
              key="history"
              challenges={completedChallenges}
              currentStudentId={currentStudentId}
              onViewDetails={setSelectedChallenge}
            />
          )}
        </AnimatePresence>

        {/* Challenge Details Modal */}
        <AnimatePresence>
          {selectedChallenge && (
            <ChallengeDetailsModal
              challenge={selectedChallenge}
              currentStudentId={currentStudentId}
              onClose={() => setSelectedChallenge(null)}
              onAccept={onAcceptChallenge}
              onDecline={onDeclineChallenge}
              onStart={onStartChallenge}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white`}
  >
    <div className="flex items-center gap-2 mb-2 opacity-90">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <div className="text-3xl font-black">{value}</div>
  </motion.div>
);

interface ActiveChallengesTabProps {
  challenges: Challenge[];
  currentStudentId: string;
  onStartChallenge: (challengeId: string) => void;
  onViewDetails: (challenge: Challenge) => void;
}

const ActiveChallengesTab: React.FC<ActiveChallengesTabProps> = ({
  challenges,
  currentStudentId,
  onStartChallenge,
  onViewDetails,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-4"
  >
    {challenges.map((challenge) => (
      <ChallengeCard
        key={challenge.id}
        challenge={challenge}
        currentStudentId={currentStudentId}
        onAction={() => onStartChallenge(challenge.id)}
        onViewDetails={() => onViewDetails(challenge)}
        actionLabel="Start Battle"
      />
    ))}
    {challenges.length === 0 && (
      <div className="col-span-2 text-center py-20 text-gray-500">
        <Swords className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No active challenges</p>
        <p className="text-sm">Challenge someone to a battle!</p>
      </div>
    )}
  </motion.div>
);

interface PendingChallengesTabProps {
  challenges: Challenge[];
  currentStudentId: string;
  onAccept: (challengeId: string) => Promise<void>;
  onDecline: (challengeId: string) => Promise<void>;
  onViewDetails: (challenge: Challenge) => void;
}

const PendingChallengesTab: React.FC<PendingChallengesTabProps> = ({
  challenges,
  currentStudentId,
  onAccept,
  onDecline,
  onViewDetails,
}) => {
  const [processing, setProcessing] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {challenges.map((challenge) => (
        <motion.div
          key={challenge.id}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-800 to-red-800 rounded-xl p-6 text-white border-2 border-orange-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Swords className="w-5 h-5" />
              <span className="font-bold text-sm">INCOMING CHALLENGE</span>
            </div>
          </div>

          {/* Challenger */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl">
              {challenge.challengerAvatar || '🧑'}
            </div>
            <div>
              <h3 className="font-bold text-lg">{challenge.challengerName}</h3>
              <p className="text-sm opacity-75">Level {challenge.challengerLevel}</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-black/20 rounded-lg p-3 mb-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-75">Topic</span>
              <span className="font-bold">{challenge.topic}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Problems</span>
              <span className="font-bold">{challenge.problemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Time Limit</span>
              <span className="font-bold">{challenge.timeLimit}s per problem</span>
            </div>
            {(challenge.wagerCoins > 0 || challenge.wagerGems > 0) && (
              <div className="flex items-center justify-between">
                <span className="opacity-75">Wager</span>
                <span className="font-bold">
                  {challenge.wagerCoins > 0 && `${challenge.wagerCoins} 🪙`}
                  {challenge.wagerCoins > 0 && challenge.wagerGems > 0 && ' • '}
                  {challenge.wagerGems > 0 && `${challenge.wagerGems} 💎`}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                setProcessing(challenge.id);
                try {
                  await onAccept(challenge.id);
                  fireConfetti({ particleCount: 100, spread: 90 });
                } finally {
                  setProcessing(null);
                }
              }}
              disabled={processing === challenge.id}
              className="py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={async () => {
                setProcessing(challenge.id);
                try {
                  await onDecline(challenge.id);
                } finally {
                  setProcessing(null);
                }
              }}
              disabled={processing === challenge.id}
              className="py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        </motion.div>
      ))}
      {challenges.length === 0 && (
        <div className="col-span-2 text-center py-20 text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold">No pending challenges</p>
          <p className="text-sm">You have no incoming challenges at the moment</p>
        </div>
      )}
    </motion.div>
  );
};

interface HistoryTabProps {
  challenges: Challenge[];
  currentStudentId: string;
  onViewDetails: (challenge: Challenge) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ challenges, currentStudentId, onViewDetails }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-3"
  >
    {challenges.map((challenge) => {
      const isWinner = challenge.winnerId === currentStudentId;
      const isDraw = challenge.challengerScore === challenge.opponentScore;
      const isChallenger = challenge.challengerId === currentStudentId;

      return (
        <motion.div
          key={challenge.id}
          whileHover={{ scale: 1.01 }}
          onClick={() => onViewDetails(challenge)}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            isWinner
              ? 'bg-gradient-to-r from-green-800 to-green-900 border-2 border-green-500'
              : isDraw
              ? 'bg-gradient-to-r from-yellow-800 to-yellow-900 border-2 border-yellow-500'
              : 'bg-gradient-to-r from-red-800 to-red-900 border-2 border-red-500'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Players */}
            <div className="flex items-center gap-4 flex-1">
              {/* You */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                  {isChallenger ? challenge.challengerAvatar || '🧑' : challenge.opponentAvatar || '🧑'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {isChallenger ? challenge.challengerName : challenge.opponentName} (You)
                  </p>
                  <p className="text-xs text-gray-300">
                    {isChallenger ? challenge.challengerScore : challenge.opponentScore} pts •{' '}
                    {isChallenger ? challenge.challengerAccuracy?.toFixed(1) : challenge.opponentAccuracy?.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* VS */}
              <div className="text-white font-black text-xl px-4">VS</div>

              {/* Opponent */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-2xl">
                  {isChallenger ? challenge.opponentAvatar || '🧑' : challenge.challengerAvatar || '🧑'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {isChallenger ? challenge.opponentName : challenge.challengerName}
                  </p>
                  <p className="text-xs text-gray-300">
                    {isChallenger ? challenge.opponentScore : challenge.challengerScore} pts •{' '}
                    {isChallenger ? challenge.opponentAccuracy?.toFixed(1) : challenge.challengerAccuracy?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Result Badge */}
            <div className={`px-6 py-3 rounded-full font-black text-lg ${
              isWinner
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                : isDraw
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-black'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {isWinner ? (
                <>
                  <Trophy className="w-5 h-5 inline mr-2" />
                  VICTORY
                </>
              ) : isDraw ? (
                'DRAW'
              ) : (
                'DEFEAT'
              )}
            </div>
          </div>
        </motion.div>
      );
    })}
    {challenges.length === 0 && (
      <div className="text-center py-20 text-gray-500">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No battle history</p>
        <p className="text-sm">Start your first challenge to build your record!</p>
      </div>
    )}
  </motion.div>
);

interface ChallengeCardProps {
  challenge: Challenge;
  currentStudentId: string;
  onAction: () => void;
  onViewDetails: () => void;
  actionLabel: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  currentStudentId,
  onAction,
  onViewDetails,
  actionLabel,
}) => {
  const isChallenger = challenge.challengerId === currentStudentId;
  const opponent = isChallenger
    ? { name: challenge.opponentName, level: challenge.opponentLevel, avatar: challenge.opponentAvatar }
    : { name: challenge.challengerName, level: challenge.challengerLevel, avatar: challenge.challengerAvatar };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-red-800 to-orange-800 rounded-xl p-6 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <Swords className="w-5 h-5" />
          <span className="font-bold text-sm">ACTIVE BATTLE</span>
        </div>
        <span className="text-xs bg-black/30 px-3 py-1 rounded-full">{challenge.topic}</span>
      </div>

      {/* Battle Preview */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
            {isChallenger ? challenge.challengerAvatar || '🧑' : challenge.opponentAvatar || '🧑'}
          </div>
          <p className="font-bold text-sm">You</p>
          <p className="text-xs opacity-75">Level {isChallenger ? challenge.challengerLevel : challenge.opponentLevel}</p>
        </div>

        <div className="text-3xl font-black">VS</div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
            {opponent.avatar || '🧑'}
          </div>
          <p className="font-bold text-sm">{opponent.name}</p>
          <p className="text-xs opacity-75">Level {opponent.level}</p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-black/20 rounded-lg p-3 mb-4 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="opacity-75">Problems</span>
          <span className="font-bold">{challenge.problemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-75">Time Limit</span>
          <span className="font-bold">{challenge.timeLimit}s each</span>
        </div>
        {(challenge.wagerCoins > 0 || challenge.wagerGems > 0) && (
          <div className="flex items-center justify-between">
            <span className="opacity-75">Prize Pool</span>
            <span className="font-bold">
              {challenge.wagerCoins > 0 && `${challenge.wagerCoins * 2} 🪙`}
              {challenge.wagerCoins > 0 && challenge.wagerGems > 0 && ' • '}
              {challenge.wagerGems > 0 && `${challenge.wagerGems * 2} 💎`}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAction}
          className="py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
        <button
          onClick={onViewDetails}
          className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
};

interface ChallengeDetailsModalProps {
  challenge: Challenge;
  currentStudentId: string;
  onClose: () => void;
  onAccept?: (challengeId: string) => Promise<void>;
  onDecline?: (challengeId: string) => Promise<void>;
  onStart?: (challengeId: string) => void;
}

const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({
  challenge,
  currentStudentId,
  onClose,
  onAccept,
  onDecline,
  onStart,
}) => {
  const [processing, setProcessing] = useState(false);
  const isChallenger = challenge.challengerId === currentStudentId;
  const isPending = challenge.status === 'PENDING';
  const isCompleted = challenge.status === 'COMPLETED';
  const isWinner = challenge.winnerId === currentStudentId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-2xl w-full border-2 border-orange-500/50 shadow-2xl"
      >
        <h2 className="text-3xl font-black text-white mb-6 text-center">Challenge Details</h2>

        {/* Battle Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Challenger */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-3">
              {challenge.challengerAvatar || '🧑'}
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{challenge.challengerName}</h3>
            <p className="text-gray-400 text-sm mb-3">Level {challenge.challengerLevel}</p>
            {isCompleted && (
              <div className="bg-gray-800 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-white font-bold">{challenge.challengerScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-white font-bold">{challenge.challengerAccuracy?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white font-bold">{challenge.challengerTime}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Opponent */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-3">
              {challenge.opponentAvatar || '🧑'}
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{challenge.opponentName}</h3>
            <p className="text-gray-400 text-sm mb-3">Level {challenge.opponentLevel}</p>
            {isCompleted && (
              <div className="bg-gray-800 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-white font-bold">{challenge.opponentScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-white font-bold">{challenge.opponentAccuracy?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white font-bold">{challenge.opponentTime}s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Settings */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
          <h4 className="text-white font-bold mb-3">Battle Settings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block mb-1">Topic</span>
              <span className="text-white font-bold">{challenge.topic}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Problems</span>
              <span className="text-white font-bold">{challenge.problemCount}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Time Limit</span>
              <span className="text-white font-bold">{challenge.timeLimit}s per problem</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Wager</span>
              <span className="text-white font-bold">
                {challenge.wagerCoins > 0 && `${challenge.wagerCoins} 🪙`}
                {challenge.wagerCoins > 0 && challenge.wagerGems > 0 && ' • '}
                {challenge.wagerGems > 0 && `${challenge.wagerGems} 💎`}
                {challenge.wagerCoins === 0 && challenge.wagerGems === 0 && 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Result */}
        {isCompleted && (
          <div className={`text-center py-6 rounded-xl mb-6 ${
            isWinner
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            <Trophy className="w-12 h-12 mx-auto mb-2 text-white" />
            <p className="text-white font-black text-2xl">
              {isWinner ? 'VICTORY!' : 'DEFEAT'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isPending && !isChallenger && onAccept && onDecline && (
            <>
              <button
                onClick={async () => {
                  setProcessing(true);
                  try {
                    await onAccept(challenge.id);
                    fireConfetti({ particleCount: 100, spread: 90 });
                    onClose();
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
                className="flex-1 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                Accept Challenge
              </button>
              <button
                onClick={async () => {
                  setProcessing(true);
                  try {
                    await onDecline(challenge.id);
                    onClose();
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {challenge.status === 'ACTIVE' && onStart && (
            <button
              onClick={() => {
                onStart(challenge.id);
                onClose();
              }}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold rounded-xl transition-colors"
            >
              Start Battle
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChallengeArena;