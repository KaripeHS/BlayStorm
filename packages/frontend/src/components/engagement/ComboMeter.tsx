import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

interface ComboMeterProps {
  combo?: number;
  currentCombo?: number;
  maxCombo: number;
  multiplier: number;
  onBreak?: () => void;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({
  combo: comboProp,
  currentCombo,
  maxCombo,
  multiplier,
  onBreak,
}) => {
  const combo = comboProp ?? currentCombo ?? 0;
  const [prevCombo, setPrevCombo] = useState(combo);
  const [showMilestone, setShowMilestone] = useState(false);

  useEffect(() => {
    // Check if combo increased
    if (combo > prevCombo) {
      // Check for milestone (every 5)
      if (combo % 5 === 0 && combo > 0) {
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 2000);
      }
    }

    // Check if combo broke
    if (combo < prevCombo) {
      onBreak?.();
    }

    setPrevCombo(combo);
  }, [combo, prevCombo, onBreak]);

  const getComboColor = () => {
    if (combo >= 50) return 'from-red-500 to-orange-500';
    if (combo >= 20) return 'from-orange-500 to-yellow-500';
    if (combo >= 10) return 'from-yellow-500 to-green-500';
    if (combo >= 5) return 'from-green-500 to-blue-500';
    return 'from-blue-500 to-purple-500';
  };

  const getMultiplierText = () => {
    if (multiplier >= 3) return 'MAX POWER!';
    if (multiplier >= 2.5) return 'INCREDIBLE!';
    if (multiplier >= 2) return 'AMAZING!';
    if (multiplier >= 1.5) return 'GREAT!';
    if (multiplier >= 1.25) return 'GOOD!';
    return 'KEEP GOING!';
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <AnimatePresence>
        {combo > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative"
          >
            {/* Main Combo Display */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 border-4 border-yellow-500">
              {/* Combo Icon */}
              <div className="flex items-center justify-center mb-2">
                <motion.div
                  animate={{ rotate: combo > 10 ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                >
                  {combo >= 10 ? (
                    <Flame className="w-8 h-8 text-orange-500" />
                  ) : (
                    <Zap className="w-8 h-8 text-yellow-500" />
                  )}
                </motion.div>
              </div>

              {/* Combo Counter */}
              <div className="text-center">
                <motion.div
                  key={combo}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getComboColor()}`}
                >
                  {combo}
                </motion.div>
                <div className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  COMBO
                </div>
              </div>

              {/* Multiplier Badge */}
              {multiplier > 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-4 py-2 text-center"
                >
                  <div className="text-2xl font-black text-white">
                    {multiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs font-bold text-white/80">
                    {getMultiplierText()}
                  </div>
                </motion.div>
              )}

              {/* Progress to Next Milestone */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Next Bonus</span>
                  <span>{Math.ceil(combo / 5) * 5}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((combo % 5) / 5) * 100}%`,
                    }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Max Combo Display */}
              {maxCombo > 0 && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-gray-400">Personal Best</div>
                  <div className="text-xl font-bold text-yellow-400">{maxCombo}</div>
                </div>
              )}
            </div>

            {/* Animated Glow Effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getComboColor()} blur-xl -z-10`}
            />

            {/* Milestone Celebration */}
            <AnimatePresence>
              {showMilestone && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-black text-xl shadow-2xl">
                    🎉 MILESTONE! +{combo * 2} BONUS!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComboMeter;