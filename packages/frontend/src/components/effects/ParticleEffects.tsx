import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Particle Types
export type ParticleType = 'star' | 'coin' | 'gem' | 'xp' | 'sparkle' | 'number';

interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  value?: number | string;
}

interface ParticleEffectsProps {
  particles: Particle[];
  onParticleComplete?: (id: string) => void;
}

export const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  particles,
  onParticleComplete,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <ParticleItem
            key={particle.id}
            particle={particle}
            onComplete={() => onParticleComplete?.(particle.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ParticleItemProps {
  particle: Particle;
  onComplete: () => void;
}

const ParticleItem: React.FC<ParticleItemProps> = ({ particle, onComplete }) => {
  const getParticleContent = () => {
    switch (particle.type) {
      case 'star':
        return <StarParticle />;
      case 'coin':
        return <CoinParticle />;
      case 'gem':
        return <GemParticle />;
      case 'xp':
        return <XPParticle value={particle.value as number} />;
      case 'sparkle':
        return <SparkleParticle />;
      case 'number':
        return <NumberParticle value={particle.value as string} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 0 }}
      animate={{
        y: particle.y - 100,
        opacity: 0,
        scale: [0, 1.2, 1, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute"
    >
      {getParticleContent()}
    </motion.div>
  );
};

// Individual Particle Components

const StarParticle: React.FC = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    className="text-4xl"
  >
    ⭐
  </motion.div>
);

const CoinParticle: React.FC = () => (
  <motion.div
    animate={{ rotateY: [0, 180, 360] }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="text-3xl"
  >
    🪙
  </motion.div>
);

const GemParticle: React.FC = () => (
  <motion.div
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
    className="text-3xl"
  >
    💎
  </motion.div>
);

const XPParticle: React.FC<{ value: number }> = ({ value }) => (
  <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
    +{value} XP
  </div>
);

const SparkleParticle: React.FC = () => (
  <motion.div
    animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
    transition={{ duration: 1 }}
    className="text-2xl"
  >
    ✨
  </motion.div>
);

const NumberParticle: React.FC<{ value: string }> = ({ value }) => (
  <div className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
    {value}
  </div>
);

// ==================== CONFETTI EFFECTS ====================

export const fireConfetti = (options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}) => {
  confetti({
    particleCount: options?.particleCount || 100,
    spread: options?.spread || 70,
    origin: options?.origin || { x: 0.5, y: 0.5 },
    colors: options?.colors || ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  });
};

export const fireworksEffect = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire from two different positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

export const coinRainEffect = () => {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500'],
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};

export const starBurstEffect = (x: number, y: number) => {
  confetti({
    particleCount: 30,
    spread: 360,
    origin: { x, y },
    colors: ['#FFD700', '#FFFF00', '#FFA500'],
    shapes: ['star'],
    scalar: 1.2,
  });
};

// ==================== COMBO METER EFFECT ====================

interface ComboAnimationProps {
  combo: number;
  multiplier: number;
}

export const ComboAnimation: React.FC<ComboAnimationProps> = ({ combo, multiplier }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (combo > 0) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  if (!show || combo === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
        >
          {combo}x
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mt-2 drop-shadow-lg"
        >
          COMBO!
        </motion.div>
        {multiplier > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-400 mt-2"
          >
            {multiplier}x Multiplier!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== LEVEL UP EFFECT ====================

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  newLevel,
  onComplete,
}) => {
  useEffect(() => {
    fireworksEffect();
    const timer = setTimeout(() => onComplete?.(), 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-black text-yellow-400 mb-4"
        >
          LEVEL UP!
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]"
        >
          {newLevel}
        </motion.div>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-3xl font-bold text-white mt-6"
        >
          You're getting stronger!
        </motion.div>
      </div>
    </motion.div>
  );
};

// ==================== CORRECT/INCORRECT FEEDBACK ====================

interface FeedbackAnimationProps {
  isCorrect: boolean;
  onComplete?: () => void;
}

export const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  isCorrect,
  onComplete,
}) => {
  useEffect(() => {
    if (isCorrect) {
      fireConfetti({ particleCount: 50, spread: 60 });
    }
    const timer = setTimeout(() => onComplete?.(), 1000);
    return () => clearTimeout(timer);
  }, [isCorrect, onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div
        className={`text-9xl ${
          isCorrect ? 'text-green-500' : 'text-red-500'
        } drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]`}
      >
        {isCorrect ? '✓' : '✗'}
      </div>
    </motion.div>
  );
};

// ==================== TREASURE CHEST OPENING ====================

interface ChestOpeningAnimationProps {
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  onComplete?: () => void;
}

export const ChestOpeningAnimation: React.FC<ChestOpeningAnimationProps> = ({
  rarity,
  onComplete,
}) => {
  const colors = {
    COMMON: ['#9CA3AF', '#D1D5DB'],
    UNCOMMON: ['#10B981', '#34D399'],
    RARE: ['#3B82F6', '#60A5FA'],
    EPIC: ['#A855F7', '#C084FC'],
    LEGENDARY: ['#F59E0B', '#FBBF24'],
    MYTHIC: ['#EF4444', '#F87171'],
  };

  useEffect(() => {
    // Chest bursts open with confetti
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 },
        colors: colors[rarity],
      });
    }, 1000);

    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [rarity, onComplete]);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-9xl"
        >
          🎁
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ParticleEffects;