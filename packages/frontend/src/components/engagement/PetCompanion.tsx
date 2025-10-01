import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, TrendingUp, Sparkles, Apple, Gamepad2 } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  happiness: number;
  lastFedAt?: Date;
  lastPlayedAt?: Date;
  imageUrl: string;
  baseAbility: 'coin_boost' | 'xp_boost' | 'hint_discount' | 'all_boost';
  abilityValue: number;
}

interface PetCompanionProps {
  pet: Pet | null;
  onFeed?: () => void;
  onPlay?: () => void;
  onOpenPetManager?: () => void;
  studentCoins?: number;
}

export const PetCompanion: React.FC<PetCompanionProps> = ({
  pet,
  onFeed,
  onPlay,
  onOpenPetManager,
  studentCoins = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [petMood, setPetMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
  const [petAnimation, setPetAnimation] = useState<'idle' | 'excited' | 'sad' | 'eating' | 'playing'>('idle');
  const [showTooltip, setShowTooltip] = useState(false);
  const [canFeed, setCanFeed] = useState(true);
  const [canPlay, setCanPlay] = useState(true);

  useEffect(() => {
    if (!pet) return;

    // Determine pet mood based on happiness
    if (pet.happiness >= 70) setPetMood('happy');
    else if (pet.happiness >= 40) setPetMood('neutral');
    else setPetMood('sad');

    // Check cooldowns
    if (pet.lastFedAt) {
      const timeSinceFed = Date.now() - new Date(pet.lastFedAt).getTime();
      setCanFeed(timeSinceFed > 3600000); // 1 hour
    }

    if (pet.lastPlayedAt) {
      const timeSincePlayed = Date.now() - new Date(pet.lastPlayedAt).getTime();
      setCanPlay(timeSincePlayed > 3600000); // 1 hour
    }
  }, [pet]);

  if (!pet) {
    return (
      <motion.button
        initial={{ scale: 0, x: 100 }}
        animate={{ scale: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        onClick={onOpenPetManager}
        className="fixed bottom-4 right-4 z-40 w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-4xl border-4 border-white"
      >
        🐾
      </motion.button>
    );
  }

  const happinessColor =
    pet.happiness >= 70 ? 'text-green-500' : pet.happiness >= 40 ? 'text-yellow-500' : 'text-red-500';
  const happinessGradient =
    pet.happiness >= 70
      ? 'from-green-500 to-blue-500'
      : pet.happiness >= 40
      ? 'from-yellow-500 to-orange-500'
      : 'from-red-500 to-pink-500';

  const getPetAnimationClass = () => {
    switch (petAnimation) {
      case 'excited':
        return 'animate-bounce';
      case 'sad':
        return '';
      case 'eating':
        return 'animate-pulse';
      case 'playing':
        return 'animate-spin';
      default:
        return '';
    }
  };

  const getBonusIcon = () => {
    switch (pet.baseAbility) {
      case 'coin_boost':
        return '🪙';
      case 'xp_boost':
        return '⭐';
      case 'hint_discount':
        return '💡';
      case 'all_boost':
        return '✨';
    }
  };

  const getBonusText = () => {
    const bonus = Math.floor(pet.abilityValue * (1 + pet.level * 0.05) * (pet.happiness / 100));
    switch (pet.baseAbility) {
      case 'coin_boost':
        return `+${bonus}% Coins`;
      case 'xp_boost':
        return `+${bonus}% XP`;
      case 'hint_discount':
        return `-${bonus}% Hints`;
      case 'all_boost':
        return `+${bonus}% All!`;
    }
  };

  const handleFeed = async () => {
    if (!canFeed || studentCoins < 10) return;
    setPetAnimation('eating');
    await onFeed?.();
    setTimeout(() => setPetAnimation('idle'), 2000);
  };

  const handlePlay = async () => {
    if (!canPlay) return;
    setPetAnimation('playing');
    await onPlay?.();
    setTimeout(() => setPetAnimation('idle'), 2000);
  };

  return (
    <>
      {/* Collapsed Pet Icon */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: 100 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="relative"
            >
              {/* Pet Avatar */}
              <motion.div
                animate={{
                  y: petMood === 'happy' ? [0, -10, 0] : petMood === 'sad' ? [0, 5, 0] : 0,
                }}
                transition={{
                  repeat: Infinity,
                  duration: petMood === 'happy' ? 1 : petMood === 'sad' ? 2 : 3,
                }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-6xl border-4 border-white"
              >
                {pet.imageUrl || '🐾'}
              </motion.div>

              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                {pet.level}
              </div>

              {/* Happiness Indicator */}
              <div
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 ${happinessColor}`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold">{pet.happiness}%</span>
              </div>

              {/* Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${happinessGradient} blur-xl -z-10`}
              />

              {/* Needs Attention Pulse */}
              {pet.happiness < 50 && (
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                  className="absolute inset-0 rounded-full border-4 border-red-500"
                />
              )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-0 right-28 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl border border-gray-700"
                >
                  <div className="font-bold">{pet.name}</div>
                  <div className="text-xs text-gray-400">{getBonusText()}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Pet Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scale: 0, x: 100, y: 100 }}
            animate={{ scale: 1, x: 0, y: 0 }}
            exit={{ scale: 0, x: 100, y: 100 }}
            className="fixed bottom-4 right-4 z-40 w-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-2 border-purple-500/50 overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${happinessGradient} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      y: petMood === 'happy' ? [0, -5, 0] : 0,
                      rotate: petAnimation === 'playing' ? 360 : 0,
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 1 },
                      rotate: { duration: 1 },
                    }}
                    className={`text-5xl ${getPetAnimationClass()}`}
                  >
                    {pet.imageUrl || '🐾'}
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>Level {pet.level}</span>
                      <span className="text-yellow-300">{getBonusIcon()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-4">
              {/* XP Progress */}
              <div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>XP Progress</span>
                  </div>
                  <span>
                    {pet.xp} / {pet.xpToNextLevel}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(pet.xp / pet.xpToNextLevel) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Happiness */}
              <div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${happinessColor}`} />
                    <span>Happiness</span>
                  </div>
                  <span className={happinessColor}>{pet.happiness}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pet.happiness}%` }}
                    className={`h-full bg-gradient-to-r ${happinessGradient}`}
                  />
                </div>
              </div>

              {/* Active Bonus */}
              <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-white">Active Bonus</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-400">{getBonusText()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                {/* Feed Button */}
                <motion.button
                  whileHover={{ scale: canFeed && studentCoins >= 10 ? 1.05 : 1 }}
                  whileTap={{ scale: canFeed && studentCoins >= 10 ? 0.95 : 1 }}
                  onClick={handleFeed}
                  disabled={!canFeed || studentCoins < 10}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold transition-all ${
                    canFeed && studentCoins >= 10
                      ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white hover:shadow-lg'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Apple className="w-6 h-6" />
                  <span className="text-sm">Feed</span>
                  <span className="text-xs opacity-75">10 🪙</span>
                  {!canFeed && (
                    <span className="text-xs text-red-400">Cooldown</span>
                  )}
                </motion.button>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: canPlay ? 1.05 : 1 }}
                  whileTap={{ scale: canPlay ? 0.95 : 1 }}
                  onClick={handlePlay}
                  disabled={!canPlay}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold transition-all ${
                    canPlay
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Gamepad2 className="w-6 h-6" />
                  <span className="text-sm">Play</span>
                  <span className="text-xs opacity-75">Free!</span>
                  {!canPlay && (
                    <span className="text-xs text-red-400">Cooldown</span>
                  )}
                </motion.button>
              </div>

              {/* Manage Button */}
              <button
                onClick={onOpenPetManager}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
              >
                Manage Pets
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PetCompanion;