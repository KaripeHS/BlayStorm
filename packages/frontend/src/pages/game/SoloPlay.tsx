import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../../stores/game-store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Send, Star, Trophy, Zap, Target, Heart, Gift } from 'lucide-react';
import { fireConfetti, fireworksEffect, coinRainEffect, starBurstEffect } from '../../components/effects/ParticleEffects';
import { ComboMeter } from '../../components/engagement/ComboMeter';
import { DailyQuests } from '../../components/engagement/DailyQuests';
import { PetCompanion } from '../../components/engagement/PetCompanion';
import { ToastContainer } from '../../components/engagement/NotificationCenter';
import { BossBattle } from '../../components/engagement/BossBattle';
import { TreasureChestOpening } from '../../components/engagement/TreasureChestOpening';
import engagementApi from '../../services/api/engagement';

// Types for engagement data that would come from API
interface Quest {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  coinReward: number;
  xpReward: number;
  gemReward: number;
  isClaimed: boolean;
}

interface ComboData {
  currentCombo: number;
  maxCombo: number;
  multiplier: number;
  comboBreak: boolean;
}

interface Pet {
  id: string;
  name: string;
  emoji: string;
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  happiness: number;
  bonusType: string;
  bonusValue: number;
  lastFed?: Date;
  lastPlayed?: Date;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'achievement' | 'reward' | 'level_up';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface TreasureChest {
  id: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  rewards: {
    coins: number;
    gems: number;
    xp: number;
    items?: string[];
  };
}

export default function SoloPlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    session,
    currentProblem,
    hintsUsed,
    streak,
    startSession,
    endSession,
    getNextProblem,
    submitAnswer,
    getHint,
  } = useGameStore();

  // Boss Battle Mode
  const isBossMode = searchParams.get('mode') === 'boss';
  const [bossBattle, setBossBattle] = useState<any | null>(null);
  const [showBossOverlay, setShowBossOverlay] = useState(false);

  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [problemStartTime, setProblemStartTime] = useState<number>(Date.now());

  // Engagement System State
  const [comboData, setComboData] = useState<ComboData>({
    currentCombo: 0,
    maxCombo: 0,
    multiplier: 1.0,
    comboBreak: false,
  });
  const [quests, setQuests] = useState<Quest[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [foundTreasure, setFoundTreasure] = useState<any | null>(null);
  const [showTreasureModal, setShowTreasureModal] = useState(false);
  const [showBattlePassProgress, setShowBattlePassProgress] = useState(false);
  const [battlePassXpGained, setBattlePassXpGained] = useState(0);
  const [questsUpdated, setQuestsUpdated] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((Date.now() - problemStartTime) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [problemStartTime]);

  useEffect(() => {
    initGame();
    return () => {
      if (session) {
        endSession();
      }
    };
  }, []);

  const initGame = async () => {
    try {
      // If boss mode, load boss battle
      if (isBossMode) {
        const battle = await engagementApi.getActiveBattle();
        if (battle) {
          setBossBattle(battle);
          setShowBossOverlay(true);
        } else {
          // No active battle, redirect to bosses page
          navigate('/bosses');
          return;
        }
      }

      await startSession(isBossMode ? 'BOSS_BATTLE' : 'SOLO_PRACTICE');
      await getNextProblem();
      setProblemStartTime(Date.now());

      // Load engagement data (would come from API in real app)
      await loadEngagementData();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const loadEngagementData = async () => {
    // Mock data - in real app, this would be API calls
    setQuests([
      {
        id: '1',
        name: 'Problem Solver',
        description: 'Solve 10 problems',
        progress: 3,
        target: 10,
        coinReward: 100,
        xpReward: 50,
        gemReward: 5,
        isClaimed: false,
      },
      {
        id: '2',
        name: 'Perfect Accuracy',
        description: 'Get 5 problems correct in a row',
        progress: comboData.currentCombo,
        target: 5,
        coinReward: 200,
        xpReward: 100,
        gemReward: 10,
        isClaimed: false,
      },
      {
        id: '3',
        name: 'Speed Demon',
        description: 'Solve 3 problems in under 30 seconds each',
        progress: 0,
        target: 3,
        coinReward: 150,
        xpReward: 75,
        gemReward: 8,
        isClaimed: false,
      },
    ]);

    setCurrentPet({
      id: 'pet1',
      name: 'Mathie',
      emoji: '🐉',
      level: 5,
      currentXp: 250,
      xpForNextLevel: 500,
      happiness: 85,
      bonusType: 'xp_boost',
      bonusValue: 10,
    });
  };

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const newToast = { ...toast, id: Date.now().toString() };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    setHint(null);

    const actualTimeSpent = Math.floor((Date.now() - problemStartTime) / 1000);

    try {
      const result = await submitAnswer(userAnswer);
      setFeedback(result);
      setShowExplanation(true);

      // ===== ENGAGEMENT SYSTEMS CASCADE =====

      if (result.isCorrect) {
        // 1. CELEBRATIONS
        fireConfetti({ particleCount: 100, spread: 90 });
        if (comboData.currentCombo >= 4) {
          fireworksEffect(); // Extra celebration for combo
        }
        if (actualTimeSpent < (currentProblem?.estimatedTime || 60)) {
          coinRainEffect(); // Speed bonus celebration
        }

        // 2. COMBO SYSTEM
        const newCombo = comboData.currentCombo + 1;
        const newMaxCombo = Math.max(newCombo, comboData.maxCombo);
        const newMultiplier = calculateMultiplier(newCombo);
        setComboData({
          currentCombo: newCombo,
          maxCombo: newMaxCombo,
          multiplier: newMultiplier,
          comboBreak: false,
        });

        // Show combo milestone toasts
        if (newCombo === 5) {
          addToast({
            type: 'achievement',
            title: '5 Combo!',
            message: `${newMultiplier}x multiplier activated! 🔥`,
            icon: '⚡',
          });
        } else if (newCombo === 10) {
          addToast({
            type: 'achievement',
            title: '10 COMBO!',
            message: `You're on fire! ${newMultiplier}x multiplier! 🔥🔥`,
            icon: '⚡',
          });
          fireworksEffect();
        } else if (newCombo === 20) {
          addToast({
            type: 'achievement',
            title: '20 COMBO!!!',
            message: `UNSTOPPABLE! ${newMultiplier}x multiplier! 🔥🔥🔥`,
            icon: '⚡',
          });
          fireworksEffect();
        }

        // 2.5 BOSS DAMAGE (if in boss mode)
        if (isBossMode && bossBattle) {
          const baseDamage = 10 + (currentProblem?.difficulty || 1) * 5;
          const totalDamage = Math.floor(baseDamage * newMultiplier);

          try {
            const updatedBattle = await engagementApi.dealDamage(bossBattle.bossId, totalDamage);
            setBossBattle(updatedBattle);

            // Check for victory
            if (updatedBattle.currentHealth <= 0) {
              fireworksEffect();
              addToast({
                type: 'achievement',
                title: 'BOSS DEFEATED!',
                message: `You defeated ${updatedBattle.boss.name}! 🏆`,
                icon: '👑',
                duration: 5000,
              });

              // Navigate to victory screen after a delay
              setTimeout(() => {
                handleBossVictory();
              }, 3000);
            } else {
              addToast({
                type: 'success',
                title: `${totalDamage} Damage!`,
                message: `Boss health: ${updatedBattle.currentHealth}/${updatedBattle.boss.health}`,
                icon: '⚔️',
                duration: 2000,
              });
            }
          } catch (error) {
            console.error('Failed to deal damage:', error);
          }
        }

        // 3. QUEST PROGRESS
        const updatedQuests: string[] = [];
        setQuests(prev => prev.map(quest => {
          if (quest.name === 'Problem Solver' && !quest.isClaimed) {
            updatedQuests.push(quest.name);
            return { ...quest, progress: quest.progress + 1 };
          }
          if (quest.name === 'Perfect Accuracy' && !quest.isClaimed) {
            return { ...quest, progress: newCombo };
          }
          if (quest.name === 'Speed Demon' && actualTimeSpent < 30 && !quest.isClaimed) {
            updatedQuests.push(quest.name);
            return { ...quest, progress: quest.progress + 1 };
          }
          return quest;
        }));

        if (updatedQuests.length > 0) {
          setQuestsUpdated(updatedQuests);
          addToast({
            type: 'success',
            title: 'Quest Progress!',
            message: `Advanced ${updatedQuests.length} quest${updatedQuests.length > 1 ? 's' : ''}!`,
            icon: '🎯',
          });
        }

        // 4. PET XP (30% of earned XP)
        if (currentPet && result.xpEarned) {
          const petXp = Math.floor(result.xpEarned * 0.3);
          setCurrentPet(prev => {
            if (!prev) return null;
            const newPetXp = prev.currentXp + petXp;
            const leveledUp = newPetXp >= prev.xpForNextLevel;

            if (leveledUp) {
              addToast({
                type: 'level_up',
                title: `${prev.name} Leveled Up!`,
                message: `Your pet is now level ${prev.level + 1}!`,
                icon: prev.emoji,
              });
              return {
                ...prev,
                level: prev.level + 1,
                currentXp: newPetXp - prev.xpForNextLevel,
                xpForNextLevel: Math.floor(prev.xpForNextLevel * 1.5),
                bonusValue: prev.bonusValue + 2,
              };
            }

            return { ...prev, currentXp: newPetXp };
          });
        }

        // 5. BATTLE PASS PROGRESS (50% of earned XP)
        if (result.xpEarned) {
          const bpXp = Math.floor(result.xpEarned * 0.5);
          setBattlePassXpGained(bpXp);
          setShowBattlePassProgress(true);
          setTimeout(() => setShowBattlePassProgress(false), 3000);
        }

        // 6. TREASURE CHEST DROP (5% chance)
        const treasureRoll = Math.random();
        if (treasureRoll < 0.05) {
          try {
            const chest = await engagementApi.generateTreasure();
            setFoundTreasure(chest);
            setShowTreasureModal(true);
            addToast({
              type: 'reward',
              title: '🎁 Treasure Found!',
              message: `${chest.rarity} chest appeared!`,
              icon: '💎',
            });
            starBurstEffect(window.innerWidth / 2, window.innerHeight / 2);
          } catch (error) {
            console.error('Failed to generate treasure:', error);
          }
        }

        // 7. LEVEL UP NOTIFICATION
        if (result.didLevelUp) {
          addToast({
            type: 'level_up',
            title: `Level ${result.newLevel}!`,
            message: 'You leveled up! Keep crushing it! 🎉',
            icon: '⭐',
          });
          fireworksEffect();
        }

        // 8. SPEED BONUS NOTIFICATION
        if (actualTimeSpent < (currentProblem?.estimatedTime || 60)) {
          addToast({
            type: 'success',
            title: 'Speed Bonus! ⚡',
            message: `Solved in ${actualTimeSpent}s! +${Math.floor(result.xpEarned * 0.2)} bonus XP`,
            icon: '⚡',
          });
        }

      } else {
        // INCORRECT - Break combo
        if (comboData.currentCombo > 0) {
          setComboData(prev => ({
            ...prev,
            currentCombo: 0,
            comboBreak: true,
          }));
          addToast({
            type: 'success',
            title: 'Combo Broken',
            message: `Your ${comboData.currentCombo} combo ended. Keep trying!`,
            icon: '💔',
            duration: 2000,
          });
        }
      }

    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setUserAnswer('');
    setFeedback(null);
    setHint(null);
    setShowExplanation(false);
    setFoundTreasure(null);
    setQuestsUpdated([]);
    await getNextProblem();
    setProblemStartTime(Date.now());
  };

  const handleGetHint = async () => {
    try {
      const hintText = await getHint();
      setHint(hintText);
    } catch (error) {
      console.error('Get hint error:', error);
    }
  };

  const handleGoBack = async () => {
    await endSession();
    navigate('/home');
  };

  const handleClaimQuest = async (questId: string) => {
    setQuests(prev => prev.map(q =>
      q.id === questId ? { ...q, isClaimed: true } : q
    ));
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      addToast({
        type: 'reward',
        title: 'Quest Completed!',
        message: `+${quest.coinReward} coins, +${quest.xpReward} XP, +${quest.gemReward} gems`,
        icon: '🎁',
      });
      fireConfetti({ particleCount: 100, spread: 90 });
    }
  };

  const handleFeedPet = async () => {
    if (!currentPet) return;
    setCurrentPet(prev => {
      if (!prev) return null;
      return {
        ...prev,
        happiness: Math.min(100, prev.happiness + 10),
        lastFed: new Date(),
      };
    });
    addToast({
      type: 'success',
      title: `${currentPet.name} is happy!`,
      message: '+10 happiness',
      icon: currentPet.emoji,
    });
  };

  const handlePlayWithPet = async () => {
    if (!currentPet) return;
    setCurrentPet(prev => {
      if (!prev) return null;
      return {
        ...prev,
        happiness: Math.min(100, prev.happiness + 5),
        lastPlayed: new Date(),
      };
    });
    addToast({
      type: 'success',
      title: `${currentPet.name} had fun!`,
      message: '+5 happiness',
      icon: currentPet.emoji,
    });
  };

  const calculateMultiplier = (combo: number): number => {
    if (combo < 3) return 1.0;
    if (combo < 5) return 1.25;
    if (combo < 10) return 1.5;
    if (combo < 20) return 2.0;
    if (combo < 50) return 2.5;
    return 3.0;
  };

  const handleBossVictory = async () => {
    await endSession();
    navigate('/bosses');
  };

  const handleBossRetreat = async () => {
    if (!bossBattle) return;

    try {
      await engagementApi.abandonBattle(bossBattle.bossId);
      await endSession();
      navigate('/bosses');
    } catch (error) {
      console.error('Failed to retreat:', error);
    }
  };

  const handleBossDamageDealt = (damage: number) => {
    // This is called from BossBattle component overlay
    // The actual damage dealing happens in handleSubmit
    console.log('Boss damage dealt from overlay:', damage);
  };

  const handleTreasureComplete = async () => {
    if (!foundTreasure) return;

    try {
      // Call API to open treasure and update inventory
      await engagementApi.openTreasure(foundTreasure.id);

      addToast({
        type: 'reward',
        title: 'Treasure Opened!',
        message: `Received rewards from ${foundTreasure.rarity} chest!`,
        icon: '🎁',
      });

      setShowTreasureModal(false);
      setFoundTreasure(null);
    } catch (error) {
      console.error('Failed to open treasure:', error);
      // Close anyway
      setShowTreasureModal(false);
      setFoundTreasure(null);
    }
  };

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-white text-6xl"
        >
          ⚡
        </motion.div>
        <div className="text-white text-2xl font-bold ml-4">Loading problem...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Combo Meter */}
      <div className="fixed top-20 left-4 z-40">
        <ComboMeter
          currentCombo={comboData.currentCombo}
          maxCombo={comboData.maxCombo}
          multiplier={comboData.multiplier}
        />
      </div>

      {/* Daily Quests Panel */}
      <div className="fixed top-20 right-4 z-40">
        <DailyQuests
          quests={quests as any}
          onClaimReward={handleClaimQuest}
        />
      </div>

      {/* Pet Companion */}
      {currentPet && (
        <PetCompanion
          pet={currentPet as any}
          onFeed={handleFeedPet}
          onPlay={handlePlayWithPet}
        />
      )}

      {/* Battle Pass Progress Popup */}
      <AnimatePresence>
        {showBattlePassProgress && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="font-bold">Battle Pass Progress</p>
                <p className="text-sm">+{battlePassXpGained} Battle Pass XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Update Notification */}
      <AnimatePresence>
        {questsUpdated.length > 0 && !feedback && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-96 right-4 z-40 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-xs"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <div>
                <p className="font-bold text-sm">Quest Progress!</p>
                {questsUpdated.map(name => (
                  <p key={name} className="text-xs opacity-90">{name}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/20 relative z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <div className="flex items-center gap-6 text-white">
              <motion.div
                animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-full"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-bold">{streak} day streak</span>
              </motion.div>

              <div className="flex items-center gap-2 bg-yellow-600 px-4 py-2 rounded-full">
                <Lightbulb className="w-5 h-5" />
                <span className="font-bold">{hintsUsed} hints</span>
              </div>

              <div className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-full">
                <Zap className="w-5 h-5" />
                <span className="font-bold">{timeSpent.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Problem Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold"
              >
                {currentProblem.topic.toUpperCase()}
              </motion.div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: currentProblem.difficulty }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-600">
                  Level {currentProblem.difficulty}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black text-gray-900 mb-8"
              >
                {currentProblem.question}
              </motion.h2>

              {/* Answer Input */}
              {!feedback && (
                <div className="space-y-4">
                  <motion.input
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full px-6 py-4 text-3xl text-center font-bold bg-gray-100 border-4 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Your answer..."
                    disabled={isSubmitting}
                    autoFocus
                  />

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isSubmitting || !userAnswer.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 disabled:from-gray-400 disabled:to-gray-500 text-white text-xl font-bold rounded-2xl transition-all shadow-lg"
                    >
                      <Send className="w-6 h-6" />
                      {isSubmitting ? 'Checking...' : 'Submit Answer'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGetHint}
                      disabled={isSubmitting}
                      className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl transition-all shadow-lg"
                    >
                      <Lightbulb className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {feedback.isCorrect ? (
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 border-8 border-green-400 rounded-3xl p-8 mb-6 text-center">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="text-8xl mb-4"
                        >
                          🎉
                        </motion.div>
                        <h3 className="text-5xl font-black text-white mb-4">AWESOME!</h3>
                        <p className="text-2xl text-white/90 mb-6">You nailed it!</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-yellow-200 text-lg font-bold mb-1">XP Earned</p>
                            <p className="text-white text-3xl font-black">+{Math.floor(feedback.xpEarned * comboData.multiplier)}</p>
                            {comboData.multiplier > 1 && (
                              <p className="text-yellow-200 text-sm">{comboData.multiplier}x combo!</p>
                            )}
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-yellow-200 text-lg font-bold mb-1">Coins</p>
                            <p className="text-white text-3xl font-black">+{feedback.coinsEarned}</p>
                          </div>
                        </div>

                        {feedback.didLevelUp && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-4 rounded-2xl inline-block font-black text-xl mb-4"
                          >
                            <Trophy className="w-6 h-6 inline mr-2" />
                            LEVEL UP! You're now level {feedback.newLevel}! 🎊
                          </motion.div>
                        )}

                        {foundTreasure && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-lg"
                          >
                            <Gift className="w-6 h-6 inline mr-2" />
                            {foundTreasure.rarity} Treasure Found! +{foundTreasure.rewards.coins} 🪙 +{foundTreasure.rewards.gems} 💎
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 border-8 border-red-400 rounded-3xl p-8 mb-6 text-center">
                        <motion.div
                          animate={{ rotate: [-10, 10, -10, 10, 0] }}
                          transition={{ duration: 0.5 }}
                          className="text-8xl mb-4"
                        >
                          😅
                        </motion.div>
                        <h3 className="text-5xl font-black text-white mb-4">Not Quite!</h3>
                        <p className="text-2xl text-white/90 mb-4">Keep trying - you've got this!</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                          <p className="text-white text-lg mb-2">The correct answer is:</p>
                          <p className="text-white font-black text-5xl">{feedback.correctAnswer}</p>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {showExplanation && feedback.explanation && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-blue-100 border-4 border-blue-400 rounded-2xl p-6 mb-6"
                      >
                        <h4 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                          📖 Explanation
                        </h4>
                        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                          {feedback.explanation}
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl transition-all shadow-lg"
                    >
                      Next Problem →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint */}
              <AnimatePresence>
                {hint && !feedback && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-yellow-100 border-4 border-yellow-400 rounded-2xl p-6 mt-6"
                  >
                    <h4 className="text-xl font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6" />
                      Hint #{hintsUsed}
                    </h4>
                    <p className="text-gray-800 text-lg">{hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Boss Battle Overlay */}
      {isBossMode && bossBattle && showBossOverlay && (
        <BossBattle
          boss={{
            id: bossBattle.boss.id,
            name: bossBattle.boss.name,
            description: bossBattle.boss.description,
            imageUrl: bossBattle.boss.imageUrl,
            difficulty: bossBattle.boss.difficulty,
            maxHealth: bossBattle.boss.health,
            currentHealth: bossBattle.currentHealth,
            topics: [], // TODO: Load from boss
            rewardCoins: bossBattle.boss.coinReward,
            rewardXp: bossBattle.boss.xpReward,
            rewardGems: bossBattle.boss.gemReward || 0,
          }}
          studentLevel={1} // TODO: Get from auth
          onDamageDealt={handleBossDamageDealt}
          onVictory={handleBossVictory}
          onRetreat={handleBossRetreat}
        />
      )}

      {/* Treasure Chest Opening Modal */}
      <AnimatePresence>
        {showTreasureModal && foundTreasure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <TreasureChestOpening
              chest={foundTreasure}
              onComplete={handleTreasureComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}