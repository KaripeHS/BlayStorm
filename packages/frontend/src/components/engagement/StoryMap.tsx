import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Crown, MapPin, ChevronRight, Play } from 'lucide-react';

interface World {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredLevel: number;
  theme: string;
  isUnlocked: boolean;
  chaptersCompleted: number;
  totalChapters: number;
  imageUrl: string;
}

interface Chapter {
  id: string;
  name: string;
  description: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number; // 0-3
  difficulty: number;
  problemCount: number;
  rewardCoins: number;
  rewardXp: number;
}

interface StoryMapProps {
  worlds: World[];
  selectedWorld?: World | null;
  chapters?: Chapter[];
  onSelectWorld?: (world: World) => void;
  onSelectChapter?: (chapterId: string) => Promise<void>;
  onStartChapter?: (chapterId: string) => void;
}

export const StoryMap: React.FC<StoryMapProps> = ({
  worlds,
  selectedWorld,
  chapters = [],
  onSelectWorld,
  onSelectChapter,
  onStartChapter,
}) => {
  const handleChapterClick = (chapterId: string) => {
    if (onSelectChapter) {
      onSelectChapter(chapterId);
    } else if (onStartChapter) {
      onStartChapter(chapterId);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Story Mode
          </h1>
          <p className="text-xl text-gray-300">
            Journey through 5 magical worlds and master mathematics!
          </p>
        </motion.div>

        {!selectedWorld ? (
          /* World Selection View */
          <WorldSelection worlds={worlds} onSelectWorld={onSelectWorld || (() => {})} />
        ) : (
          /* Chapter Map View */
          <ChapterMap
            world={selectedWorld}
            chapters={chapters}
            onBack={() => onSelectWorld && onSelectWorld(null as any)}
            onStartChapter={handleChapterClick}
          />
        )}
      </div>
    </div>
  );
};

// World Selection Component
interface WorldSelectionProps {
  worlds: World[];
  onSelectWorld: (world: World) => void;
}

const WorldSelection: React.FC<WorldSelectionProps> = ({ worlds, onSelectWorld }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {worlds.map((world, index) => (
        <motion.div
          key={world.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <WorldCard world={world} onSelect={onSelectWorld} />
        </motion.div>
      ))}
    </div>
  );
};

// World Card Component
interface WorldCardProps {
  world: World;
  onSelect: (world: World) => void;
}

const WorldCard: React.FC<WorldCardProps> = ({ world, onSelect }) => {
  const progressPercentage = (world.chaptersCompleted / world.totalChapters) * 100;

  return (
    <motion.button
      whileHover={{ scale: world.isUnlocked ? 1.05 : 1, y: world.isUnlocked ? -10 : 0 }}
      whileTap={{ scale: world.isUnlocked ? 0.95 : 1 }}
      onClick={() => world.isUnlocked && onSelect(world)}
      disabled={!world.isUnlocked}
      className={`relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl transition-all ${
        world.isUnlocked
          ? 'cursor-pointer'
          : 'cursor-not-allowed grayscale opacity-50'
      }`}
    >
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Lock Overlay */}
      {!world.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-white font-bold text-lg">
              Requires Level {world.requiredLevel}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-5 p-6 h-full flex flex-col justify-between">
        {/* World Order Badge */}
        <div className="self-start bg-yellow-500 text-black font-black px-4 py-2 rounded-full text-lg">
          World {world.order}
        </div>

        {/* Title & Description */}
        <div className="text-left">
          <h3 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
            {world.name}
          </h3>
          <p className="text-gray-200 text-sm drop-shadow">{world.description}</p>
        </div>

        {/* Progress Bar */}
        {world.isUnlocked && (
          <div>
            <div className="flex justify-between text-sm text-white mb-2">
              <span>Progress</span>
              <span>
                {world.chaptersCompleted} / {world.totalChapters}
              </span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Glow Effect */}
      {world.isUnlocked && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent blur-xl -z-10"
        />
      )}
    </motion.button>
  );
};

// Chapter Map Component
interface ChapterMapProps {
  world: World;
  chapters: Chapter[];
  onBack: () => void;
  onStartChapter: (chapterId: string) => void;
}

const ChapterMap: React.FC<ChapterMapProps> = ({ world, chapters, onBack, onStartChapter }) => {
  return (
    <div>
      {/* World Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Back to Worlds
        </button>

        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-8 border-2 border-purple-500/50">
          <h2 className="text-5xl font-black text-white mb-2">{world.name}</h2>
          <p className="text-xl text-gray-300 mb-4">{world.description}</p>
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>
                {world.chaptersCompleted} / {world.totalChapters} Chapters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>{world.theme}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapter Path */}
      <div className="relative">
        {/* Connecting Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <motion.path
            d={generatePath(chapters.length)}
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>

        {/* Chapters */}
        <div className="relative z-10 space-y-6">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={index % 2 === 0 ? 'ml-0 mr-auto' : 'ml-auto mr-0'}
              style={{ width: '48%' }}
            >
              <ChapterCard chapter={chapter} onStart={onStartChapter} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Chapter Card Component
interface ChapterCardProps {
  chapter: Chapter;
  onStart: (chapterId: string) => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onStart }) => {
  return (
    <motion.div
      whileHover={{ scale: chapter.isUnlocked ? 1.03 : 1 }}
      className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 ${
        chapter.isCompleted
          ? 'border-green-500'
          : chapter.isUnlocked
          ? 'border-purple-500'
          : 'border-gray-700'
      } ${!chapter.isUnlocked && 'opacity-50 grayscale'}`}
    >
      {/* Chapter Number Badge */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-xl border-4 border-gray-900 shadow-lg">
        {chapter.order}
      </div>

      {/* Lock Icon */}
      {!chapter.isUnlocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-6 h-6 text-gray-500" />
        </div>
      )}

      {/* Stars (if completed) */}
      {chapter.isCompleted && (
        <div className="absolute top-4 right-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < chapter.stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-white mb-2">{chapter.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{chapter.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <span>📚</span>
            <span>{chapter.problemCount} Problems</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Difficulty {chapter.difficulty}</span>
          </div>
        </div>

        {/* Rewards */}
        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1 text-yellow-400">
            <span>🪙</span>
            <span className="font-bold">{chapter.rewardCoins}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <Star className="w-4 h-4" />
            <span className="font-bold">{chapter.rewardXp}</span>
          </div>
        </div>

        {/* Action Button */}
        {chapter.isUnlocked && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart(chapter.id)}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${
              chapter.isCompleted
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            }`}
          >
            <Play className="w-5 h-5" />
            {chapter.isCompleted ? 'Play Again' : 'Start Chapter'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to generate SVG path
const generatePath = (chapterCount: number) => {
  let path = 'M 50% 50';
  for (let i = 0; i < chapterCount; i++) {
    const y = 100 + i * 150;
    const x = i % 2 === 0 ? '25%' : '75%';
    path += ` L ${x} ${y}`;
  }
  return path;
};

export default StoryMap;