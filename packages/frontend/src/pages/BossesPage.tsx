import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skull, Swords, Trophy, Lock, Star, Zap } from 'lucide-react';
import { useBosses } from '../hooks/useEngagement';

const BossesPage = () => {
  const navigate = useNavigate();
  const { bosses, loading, startBattle } = useBosses();
  const [starting, setStarting] = useState<string | null>(null);

  const handleStartBattle = async (bossId: string) => {
    try {
      setStarting(bossId);
      const battle = await startBattle(bossId);
      // Navigate to SoloPlay with boss mode
      navigate(`/game/solo-play?mode=boss&battleId=${battle.id}`);
    } catch (error) {
      console.error('Failed to start boss battle:', error);
      setStarting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Boss Battles...</div>
      </div>
    );
  }

  const getRarityColor = (difficulty: number) => {
    if (difficulty >= 5) return 'from-red-600 to-orange-600';
    if (difficulty >= 3) return 'from-purple-600 to-pink-600';
    return 'from-blue-600 to-cyan-600';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 5) return 'LEGENDARY';
    if (difficulty >= 3) return 'EPIC';
    return 'RARE';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Skull className="w-16 h-16 text-red-500" />
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Boss Battles
            </h1>
            <Skull className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-2xl text-gray-300">
            Face epic bosses and earn legendary rewards!
          </p>
        </motion.div>

        {/* Boss Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bosses.map((boss, index) => {
            const isLocked = boss.isLocked;
            const isStarting = starting === boss.id;

            return (
              <motion.div
                key={boss.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden ${
                  isLocked ? 'opacity-60' : ''
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(boss.difficulty)} opacity-20`} />

                {/* Content */}
                <div className="relative bg-gray-900/80 backdrop-blur-sm border-2 border-gray-700 rounded-2xl p-6 h-full">
                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r ${getRarityColor(boss.difficulty)} text-white font-bold text-sm`}>
                    {getDifficultyLabel(boss.difficulty)}
                  </div>

                  {/* Boss Image */}
                  <div className="mb-4 text-center">
                    {boss.imageUrl ? (
                      <img
                        src={boss.imageUrl}
                        alt={boss.name}
                        className="w-48 h-48 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-800 rounded-xl">
                        <Skull className="w-32 h-32 text-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Boss Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
                      {isLocked && <Lock className="w-6 h-6 text-yellow-500" />}
                      {boss.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{boss.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                          <Skull className="w-4 h-4" />
                          <span className="text-xs font-semibold">Health</span>
                        </div>
                        <p className="text-white font-bold">{boss.maxHealth.toLocaleString()}</p>
                      </div>

                      <div className="bg-purple-900/30 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
                          <Star className="w-4 h-4" />
                          <span className="text-xs font-semibold">Difficulty</span>
                        </div>
                        <p className="text-white font-bold">{boss.difficulty}/5</p>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {boss.topics.slice(0, 3).map((topic: string) => (
                        <span
                          key={topic}
                          className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Rewards */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-2">REWARDS</p>
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span>🪙</span>
                          <span className="text-yellow-400 font-bold">
                            {boss.rewardCoins}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-bold">
                            {boss.rewardXp} XP
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>💎</span>
                          <span className="text-cyan-400 font-bold">
                            {boss.rewardGems}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: isLocked ? 1 : 1.05 }}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                    onClick={() => !isLocked && handleStartBattle(boss.id)}
                    disabled={isLocked || isStarting}
                    className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                      isLocked
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isStarting
                        ? 'bg-gray-700 text-white'
                        : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500'
                    }`}
                  >
                    {isLocked ? (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="w-5 h-5" />
                        Locked - Level {boss.requiredLevel}
                      </span>
                    ) : isStarting ? (
                      'Starting Battle...'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Swords className="w-5 h-5" />
                        CHALLENGE BOSS
                      </span>
                    )}
                  </motion.button>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <p className="text-white font-bold text-xl">
                          Reach Level {boss.requiredLevel}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {bosses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Skull className="w-32 h-32 text-gray-600 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white mb-4">
              No Bosses Available Yet
            </h3>
            <p className="text-gray-400 text-lg">
              Complete more chapters to unlock epic boss battles!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BossesPage;
