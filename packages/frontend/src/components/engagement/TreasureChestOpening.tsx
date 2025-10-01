import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Crown, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Reward {
  type: 'coins' | 'xp' | 'gems' | 'item' | 'pet' | 'avatar';
  amount?: number;
  name?: string;
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  imageUrl?: string;
}

interface TreasureChest {
  id: string;
  type: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  rewards: Reward[];
}

interface TreasureChestOpeningProps {
  chest: TreasureChest;
  onComplete: () => void;
}

export const TreasureChestOpening: React.FC<TreasureChestOpeningProps> = ({
  chest,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'closed' | 'shaking' | 'opening' | 'reveal'>('closed');
  const [revealedRewards, setRevealedRewards] = useState<number>(0);

  const rarityColors = {
    COMMON: { from: '#9CA3AF', to: '#D1D5DB', glow: 'rgba(156,163,175,0.5)' },
    UNCOMMON: { from: '#10B981', to: '#34D399', glow: 'rgba(16,185,129,0.5)' },
    RARE: { from: '#3B82F6', to: '#60A5FA', glow: 'rgba(59,130,246,0.8)' },
    EPIC: { from: '#A855F7', to: '#C084FC', glow: 'rgba(168,85,247,0.8)' },
    LEGENDARY: { from: '#F59E0B', to: '#FBBF24', glow: 'rgba(245,158,11,1)' },
    MYTHIC: { from: '#EF4444', to: '#F87171', glow: 'rgba(239,68,68,1)' },
  };

  const colors = rarityColors[chest.rarity];

  useEffect(() => {
    // Animation sequence
    const sequence = async () => {
      // 1. Wait a moment
      await wait(500);

      // 2. Shake the chest
      setPhase('shaking');
      await wait(2000);

      // 3. Open the chest with explosion
      setPhase('opening');
      fireChestExplosion();
      await wait(1000);

      // 4. Reveal rewards one by one
      setPhase('reveal');
      for (let i = 0; i < chest.rewards.length; i++) {
        await wait(800);
        setRevealedRewards(i + 1);
        fireRewardConfetti();
      }

      // 5. Wait before completing
      await wait(2000);
      onComplete();
    };

    sequence();
  }, [chest.rewards.length, onComplete]);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fireChestExplosion = () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.6 },
      colors: [colors.from, colors.to],
      startVelocity: 45,
    });
  };

  const fireRewardConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B'],
    });
  };

  const getChestEmoji = () => {
    switch (chest.rarity) {
      case 'COMMON':
        return '📦';
      case 'UNCOMMON':
        return '🎁';
      case 'RARE':
        return '💎';
      case 'EPIC':
        return '👑';
      case 'LEGENDARY':
        return '🏆';
      case 'MYTHIC':
        return '⚡';
      default:
        return '🎁';
    }
  };

  const getRewardIcon = (reward: Reward) => {
    switch (reward.type) {
      case 'coins':
        return '🪙';
      case 'xp':
        return '⭐';
      case 'gems':
        return '💎';
      case 'item':
        return '✨';
      case 'pet':
        return '🐾';
      case 'avatar':
        return '👤';
      default:
        return '🎁';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl px-4">
        {/* Closed/Shaking Phase */}
        <AnimatePresence>
          {(phase === 'closed' || phase === 'shaking') && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: phase === 'shaking' ? [0, -10, 0, -10, 0] : 0,
                rotate: phase === 'shaking' ? [0, -5, 5, -5, 5, 0] : 0,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 0.5 },
                y: { duration: 0.1, repeat: phase === 'shaking' ? 10 : 0 },
                rotate: { duration: 0.1, repeat: phase === 'shaking' ? 10 : 0 },
              }}
              className="text-center"
            >
              {/* Chest */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="text-[200px] drop-shadow-2xl"
              >
                {getChestEmoji()}
              </motion.div>

              {/* Rarity Label */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <div
                  className="inline-block px-8 py-3 rounded-full font-black text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    boxShadow: `0 0 30px ${colors.glow}`,
                  }}
                >
                  {chest.rarity}
                </div>
              </motion.div>

              {/* Opening Text */}
              {phase === 'shaking' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-white text-xl font-bold"
                >
                  Opening...
                </motion.div>
              )}

              {/* Glowing effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 -z-10 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${colors.glow}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opening Phase */}
        <AnimatePresence>
          {phase === 'opening' && (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.5, 2], opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-center text-[200px]"
            >
              {getChestEmoji()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal Phase */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              {/* Title */}
              <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8"
              >
                You Received:
              </motion.h2>

              {/* Rewards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {chest.rewards.map((reward, index) => (
                  <AnimatePresence key={index}>
                    {revealedRewards > index && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <RewardCard reward={reward} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {/* Continue Button */}
              {revealedRewards === chest.rewards.length && (
                <motion.button
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="mt-8 px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold rounded-xl shadow-2xl"
                >
                  Awesome!
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface RewardCardProps {
  reward: Reward;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward }) => {
  const rarityColors = {
    COMMON: 'from-gray-500 to-gray-600',
    UNCOMMON: 'from-green-500 to-green-600',
    RARE: 'from-blue-500 to-blue-600',
    EPIC: 'from-purple-500 to-purple-600',
    LEGENDARY: 'from-yellow-500 to-orange-500',
    MYTHIC: 'from-red-500 to-pink-500',
  };

  const bgGradient = reward.rarity
    ? rarityColors[reward.rarity]
    : 'from-gray-700 to-gray-800';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-2xl border-2 border-white/20`}
    >
      {/* Sparkle Effect */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity },
        }}
        className="absolute top-2 right-2"
      >
        <Sparkles className="w-5 h-5 text-yellow-300" />
      </motion.div>

      {/* Icon/Emoji */}
      <div className="text-6xl mb-3">{getRewardIcon(reward)}</div>

      {/* Amount or Name */}
      <div className="text-center">
        {reward.amount !== undefined ? (
          <div className="text-3xl font-black text-white">
            +{reward.amount.toLocaleString()}
          </div>
        ) : (
          <div className="text-lg font-bold text-white break-words">{reward.name}</div>
        )}

        {/* Type Label */}
        <div className="text-xs font-bold text-white/70 uppercase tracking-wider mt-1">
          {reward.type}
        </div>

        {/* Rarity Badge */}
        {reward.rarity && (
          <div className="mt-2 inline-block px-3 py-1 bg-black/30 rounded-full text-xs font-bold text-white">
            {reward.rarity}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="absolute inset-0 rounded-2xl blur-xl -z-10 bg-gradient-to-br from-white/20 to-transparent"
      />
    </motion.div>
  );
};

const getRewardIcon = (reward: Reward) => {
  switch (reward.type) {
    case 'coins':
      return '🪙';
    case 'xp':
      return '⭐';
    case 'gems':
      return '💎';
    case 'item':
      return '✨';
    case 'pet':
      return '🐾';
    case 'avatar':
      return '👤';
    default:
      return '🎁';
  }
};

export default TreasureChestOpening;