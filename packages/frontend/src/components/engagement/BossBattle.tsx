import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Heart, Zap, Shield, Swords, Trophy, Crown } from 'lucide-react';
import { fireworksEffect, starBurstEffect } from '../effects/ParticleEffects';

interface Boss {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  difficulty: number;
  maxHealth: number;
  currentHealth: number;
  topics: string[];
  rewardCoins: number;
  rewardXp: number;
  rewardGems: number;
  specialRewards?: {
    pets?: string[];
    avatarItems?: string[];
  };
}

interface BossBattleProps {
  boss: Boss;
  studentLevel: number;
  onDamageDealt: (damage: number) => void;
  onVictory: () => void;
  onRetreat: () => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({
  boss,
  studentLevel,
  onDamageDealt,
  onVictory,
  onRetreat,
}) => {
  const [showDamage, setShowDamage] = useState<{ amount: number; id: string } | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'victory'>('intro');
  const [currentProblem, setCurrentProblem] = useState<any>(null);

  const healthPercentage = (boss.currentHealth / boss.maxHealth) * 100;
  const isLowHealth = healthPercentage < 30;
  const isCritical = healthPercentage < 10;

  useEffect(() => {
    // Intro phase
    const timer = setTimeout(() => {
      setBattlePhase('battle');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check for victory
    if (boss.currentHealth <= 0 && battlePhase === 'battle') {
      setBattlePhase('victory');
      fireworksEffect();
      setTimeout(() => {
        onVictory();
      }, 5000);
    }
  }, [boss.currentHealth, battlePhase, onVictory]);

  const handleDealDamage = (damage: number) => {
    const damageId = Math.random().toString();
    setShowDamage({ amount: damage, id: damageId });
    setBossShake(true);

    // Trigger damage effect
    onDamageDealt(damage);

    // Clear shake after animation
    setTimeout(() => setBossShake(false), 500);
    setTimeout(() => setShowDamage(null), 1500);
  };

  const getHealthBarColor = () => {
    if (isCritical) return 'from-red-600 to-red-800';
    if (isLowHealth) return 'from-orange-500 to-red-600';
    return 'from-green-500 to-blue-600';
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute inset-0 bg-gradient-radial from-purple-600/20 to-transparent"
        />
      </div>

      {/* Intro Phase */}
      <AnimatePresence>
        {battlePhase === 'intro' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black z-50"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <Skull className="w-32 h-32 text-red-500 mx-auto mb-6" />
              </motion.div>

              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-black text-red-500 mb-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
              >
                {boss.name}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
              >
                {boss.description}
              </motion.p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-center gap-4 text-yellow-400"
              >
                <Swords className="w-8 h-8" />
                <span className="text-3xl font-bold">BATTLE BEGIN!</span>
                <Swords className="w-8 h-8" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Phase */}
      <AnimatePresence>
        {battlePhase === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm z-50"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 1 }}
              >
                <Trophy className="w-40 h-40 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_50px_rgba(250,204,21,1)]" />
              </motion.div>

              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6"
              >
                VICTORY!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl text-white mb-8"
              >
                You defeated {boss.name}!
              </motion.p>

              {/* Rewards Display */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto"
              >
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">Epic Rewards!</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🪙</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {boss.rewardCoins}
                    </div>
                    <div className="text-sm text-gray-400">Coins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">⭐</div>
                    <div className="text-3xl font-bold text-purple-400">{boss.rewardXp}</div>
                    <div className="text-sm text-gray-400">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-2">💎</div>
                    <div className="text-3xl font-bold text-blue-400">{boss.rewardGems}</div>
                    <div className="text-sm text-gray-400">Gems</div>
                  </div>
                </div>

                {boss.specialRewards && (
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">
                      🎁 Special Rewards!
                    </h4>
                    <div className="space-y-2 text-white">
                      {boss.specialRewards.pets?.map((pet) => (
                        <div key={pet} className="text-lg">
                          🐾 {pet}
                        </div>
                      ))}
                      {boss.specialRewards.avatarItems?.map((item) => (
                        <div key={item} className="text-lg">
                          ✨ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Phase UI */}
      {battlePhase === 'battle' && (
        <div className="relative h-full flex flex-col">
          {/* Top HUD */}
          <div className="relative z-10 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Boss Info Card */}
              <div className="bg-gradient-to-r from-red-900/90 to-purple-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Skull className="w-10 h-10 text-red-500" />
                    <div>
                      <h2 className="text-3xl font-black text-white">{boss.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span>Level {boss.difficulty * 10} Boss</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-red-400">
                      {boss.currentHealth}
                    </div>
                    <div className="text-sm text-gray-400">/ {boss.maxHealth} HP</div>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="relative">
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-red-900">
                    <motion.div
                      animate={{ width: `${healthPercentage}%` }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className={`h-full bg-gradient-to-r ${getHealthBarColor()} relative`}
                    >
                      {/* Pulse effect when low health */}
                      {isLowHealth && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 bg-red-500"
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Health percentage */}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-lg">
                    {healthPercentage.toFixed(0)}%
                  </div>
                </div>

                {/* Warning when critical */}
                <AnimatePresence>
                  {isCritical && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center justify-center gap-2 text-red-400"
                    >
                      <Zap className="w-5 h-5 animate-pulse" />
                      <span className="font-bold text-lg animate-pulse">
                        BOSS IS ENRAGED!
                      </span>
                      <Zap className="w-5 h-5 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Boss Sprite Area */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Boss Image */}
            <motion.div
              animate={
                bossShake
                  ? { x: [-20, 20, -20, 20, 0], rotate: [-5, 5, -5, 5, 0] }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  scale: isLowHealth ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                }}
                className="text-[300px] drop-shadow-[0_0_100px_rgba(239,68,68,0.8)]"
              >
                {boss.imageUrl || '👹'}
              </motion.div>

              {/* Damage Numbers */}
              <AnimatePresence>
                {showDamage && (
                  <motion.div
                    key={showDamage.id}
                    initial={{ y: 0, opacity: 1, scale: 0 }}
                    animate={{ y: -150, opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,1)]">
                      -{showDamage.amount}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attack Effect */}
              {bossShake && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Zap className="w-40 h-40 text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Bottom Action Bar */}
          <div className="relative z-10 p-6">
            <div className="max-w-4xl mx-auto bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-500/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Your Level</div>
                    <div className="text-3xl font-bold text-blue-400">{studentLevel}</div>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                    <div className="flex gap-1">
                      {[...Array(boss.difficulty)].map((_, i) => (
                        <Skull key={i} className="w-4 h-4 text-red-500" />
                      ))}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Topics</div>
                    <div className="flex gap-2">
                      {boss.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-purple-600 rounded text-xs text-white"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetreat}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Retreat
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dev: Damage Test Button */}
      {battlePhase === 'battle' && (
        <button
          onClick={() => handleDealDamage(Math.floor(Math.random() * 200) + 50)}
          className="fixed bottom-32 right-6 z-50 px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
        >
          Test Damage
        </button>
      )}
    </div>
  );
};

export default BossBattle;