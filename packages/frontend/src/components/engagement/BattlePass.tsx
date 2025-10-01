import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Crown, Lock, Check, Gift, Sparkles, Trophy, Zap } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

type RewardType = 'COINS' | 'GEMS' | 'XP_BOOST' | 'AVATAR_ITEM' | 'PET' | 'EMOTE' | 'TITLE' | 'CHEST';
type TierType = 'FREE' | 'PREMIUM';

interface BattlePassReward {
  id: string;
  level: number;
  tier: TierType;
  type: RewardType;
  name: string;
  description: string;
  imageUrl: string;
  quantity?: number;
  isClaimed: boolean;
  isLocked: boolean;
}

interface BattlePassData {
  seasonName: string;
  seasonNumber: number;
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
  endsAt: Date;
  isPremium: boolean;
  premiumCost: number;
}

interface BattlePassProps {
  battlePassData: BattlePassData;
  rewards: BattlePassReward[];
  onClaimReward: (rewardId: string) => Promise<void>;
  onPurchasePremium?: () => Promise<void>;
}

export const BattlePass: React.FC<BattlePassProps> = ({
  battlePassData,
  rewards,
  onClaimReward,
  onPurchasePremium,
}) => {
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(battlePassData.currentLevel);

  const maxLevel = 100;
  const progressPercent = (battlePassData.currentXp / battlePassData.xpForNextLevel) * 100;

  const freeRewards = rewards.filter(r => r.tier === 'FREE');
  const premiumRewards = rewards.filter(r => r.tier === 'PREMIUM');

  const unclaimedCount = rewards.filter(
    r => !r.isClaimed && !r.isLocked && (r.tier === 'FREE' || battlePassData.isPremium)
  ).length;

  const handleClaimReward = async (reward: BattlePassReward) => {
    if (reward.isClaimed || reward.isLocked) return;
    if (reward.tier === 'PREMIUM' && !battlePassData.isPremium) {
      setShowPremiumModal(true);
      return;
    }

    setClaiming(reward.id);
    try {
      await onClaimReward(reward.id);
      fireConfetti({ particleCount: 100, spread: 90 });
    } finally {
      setClaiming(null);
    }
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(battlePassData.endsAt);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'COINS': return '🪙';
      case 'GEMS': return '💎';
      case 'XP_BOOST': return '⚡';
      case 'AVATAR_ITEM': return '👕';
      case 'PET': return '🐾';
      case 'EMOTE': return '🎭';
      case 'TITLE': return '👑';
      case 'CHEST': return '🎁';
      default: return '🎁';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500 mb-2">
                {battlePassData.seasonName}
              </h1>
              <p className="text-gray-400 text-lg">Season {battlePassData.seasonNumber}</p>
            </div>

            {/* Premium Badge or Upgrade Button */}
            {battlePassData.isPremium ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full flex items-center gap-2 font-bold text-black">
                <Crown className="w-6 h-6" />
                PREMIUM
              </div>
            ) : (
              onPurchasePremium && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 rounded-xl font-black text-white text-xl shadow-2xl"
                >
                  <Crown className="w-6 h-6 inline mr-2" />
                  UPGRADE TO PREMIUM
                </motion.button>
              )
            )}
          </div>

          {/* Season Timer */}
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Level {battlePassData.currentLevel} / {maxLevel}</span>
            </div>
            <div className="text-gray-500">•</div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              <span>{getDaysRemaining()} days remaining</span>
            </div>
            {unclaimedCount > 0 && (
              <>
                <div className="text-gray-500">•</div>
                <div className="flex items-center gap-2 text-green-400">
                  <Gift className="w-5 h-5" />
                  <span>{unclaimedCount} rewards ready to claim!</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Current Level Progress */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-2xl p-6 mb-8 border-2 border-purple-500/50 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm mb-1">Current Progress</p>
              <p className="text-white font-black text-2xl">Level {battlePassData.currentLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm mb-1">XP to Next Level</p>
              <p className="text-yellow-400 font-bold text-xl">
                {battlePassData.currentXp.toLocaleString()} / {battlePassData.xpForNextLevel.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-8 bg-gray-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {progressPercent.toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* Rewards Track */}
        <div className="bg-gray-900 rounded-2xl p-6 overflow-x-auto">
          {/* Track Labels */}
          <div className="flex gap-8 mb-4">
            <div className="w-24 flex-shrink-0 text-center">
              <p className="text-gray-400 text-sm font-bold">LEVEL</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                <Star className="w-5 h-5" />
                FREE REWARDS
              </div>
              <div className="flex items-center gap-2 text-yellow-400 font-bold">
                <Crown className="w-5 h-5" />
                PREMIUM REWARDS
                {!battlePassData.isPremium && (
                  <Lock className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="space-y-4">
            {Array.from({ length: Math.min(maxLevel, 20) }, (_, i) => i + 1).map((level) => {
              const freeReward = freeRewards.find(r => r.level === level);
              const premiumReward = premiumRewards.find(r => r.level === level);
              const isCurrentLevel = level === battlePassData.currentLevel;
              const isPastLevel = level < battlePassData.currentLevel;

              return (
                <motion.div
                  key={level}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: level * 0.02 }}
                  className={`flex gap-8 items-center ${
                    isCurrentLevel && 'bg-purple-900/30 rounded-xl p-2 -m-2 border-2 border-purple-500'
                  }`}
                >
                  {/* Level Number */}
                  <div className={`w-24 flex-shrink-0 text-center font-black text-2xl ${
                    isCurrentLevel ? 'text-purple-400' :
                    isPastLevel ? 'text-gray-500' :
                    'text-gray-600'
                  }`}>
                    {level}
                  </div>

                  {/* Rewards */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Free Reward */}
                    <div>
                      {freeReward ? (
                        <RewardCard
                          reward={freeReward}
                          onClaim={handleClaimReward}
                          isClaiming={claiming === freeReward.id}
                          getRewardIcon={getRewardIcon}
                        />
                      ) : (
                        <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-600">
                          <span className="text-sm">No reward</span>
                        </div>
                      )}
                    </div>

                    {/* Premium Reward */}
                    <div className="relative">
                      {premiumReward ? (
                        <RewardCard
                          reward={premiumReward}
                          onClaim={handleClaimReward}
                          isClaiming={claiming === premiumReward.id}
                          getRewardIcon={getRewardIcon}
                          isPremiumLocked={!battlePassData.isPremium}
                        />
                      ) : (
                        <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-600">
                          <span className="text-sm">No reward</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More Button */}
          {maxLevel > 20 && (
            <div className="text-center mt-6">
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">
                Show More Levels
              </button>
            </div>
          )}
        </div>

        {/* Premium Upgrade Modal */}
        <AnimatePresence>
          {showPremiumModal && onPurchasePremium && (
            <PremiumModal
              premiumCost={battlePassData.premiumCost}
              onPurchase={async () => {
                await onPurchasePremium();
                setShowPremiumModal(false);
                fireConfetti({ particleCount: 200, spread: 120 });
              }}
              onClose={() => setShowPremiumModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface RewardCardProps {
  reward: BattlePassReward;
  onClaim: (reward: BattlePassReward) => void;
  isClaiming: boolean;
  getRewardIcon: (type: RewardType) => string;
  isPremiumLocked?: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onClaim,
  isClaiming,
  getRewardIcon,
  isPremiumLocked,
}) => {
  const canClaim = !reward.isClaimed && !reward.isLocked && !isPremiumLocked;

  return (
    <motion.button
      whileHover={{ scale: canClaim ? 1.05 : 1 }}
      whileTap={{ scale: canClaim ? 0.95 : 1 }}
      onClick={() => canClaim && onClaim(reward)}
      disabled={!canClaim || isClaiming}
      className={`relative w-full h-24 rounded-xl p-3 transition-all ${
        reward.isClaimed
          ? 'bg-green-900/30 border-2 border-green-500'
          : canClaim
          ? 'bg-gradient-to-br from-purple-600 to-blue-600 hover:shadow-lg cursor-pointer'
          : 'bg-gray-800 opacity-50'
      }`}
    >
      {/* Premium Lock Overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm z-10">
          <Lock className="w-8 h-8 text-yellow-400" />
        </div>
      )}

      {/* Locked Overlay */}
      {reward.isLocked && !isPremiumLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Claimed Badge */}
      {reward.isClaimed && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-3 h-full">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0">
          {reward.imageUrl || getRewardIcon(reward.type)}
        </div>

        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">{reward.name}</h4>
          <p className="text-gray-300 text-xs line-clamp-1">{reward.description}</p>
          {reward.quantity && reward.quantity > 1 && (
            <p className="text-yellow-400 text-xs font-bold mt-1">x{reward.quantity}</p>
          )}
        </div>

        {/* Claim Indicator */}
        {canClaim && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex-shrink-0"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

interface PremiumModalProps {
  premiumCost: number;
  onPurchase: () => void;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ premiumCost, onPurchase, onClose }) => {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await onPurchase();
    } finally {
      setPurchasing(false);
    }
  };

  const premiumBenefits = [
    'Unlock all premium rewards (100+ exclusive items)',
    'Instant access to premium track',
    '2x XP boost for the entire season',
    'Exclusive avatars, pets, and emotes',
    'Special premium badge',
    'Priority access to new features',
  ];

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
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-2xl w-full border-2 border-yellow-500/50 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-4"
          >
            👑
          </motion.div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-400">Unlock the full Battle Pass experience!</p>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 mb-8">
          {premiumBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-black" />
              </div>
              <span className="text-white">{benefit}</span>
            </motion.div>
          ))}
        </div>

        {/* Purchase Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-xl rounded-xl shadow-lg hover:shadow-2xl transition-shadow mb-4"
        >
          {purchasing ? (
            'Processing...'
          ) : (
            <>
              <Crown className="w-6 h-6 inline mr-2" />
              Upgrade for {premiumCost} 💎
            </>
          )}
        </motion.button>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
        >
          Maybe Later
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BattlePass;