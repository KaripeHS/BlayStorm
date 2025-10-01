import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Trophy,
  Target,
  Users,
  Swords,
  ShoppingBag,
  User,
  Home,
  Book,
  Zap,
  Star,
  Crown,
  Gift,
  TrendingUp,
  Award,
  Heart,
  Flame
} from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { useDailyQuests, useActivePet, useBattlePass, useGuild } from '../hooks/useEngagement';
import engagementApi from '../services/api/engagement';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { quests, loading: questsLoading } = useDailyQuests();
  const { pet, loading: petLoading } = useActivePet();
  const { battlePassData, loading: bpLoading } = useBattlePass();
  const { guild, members, loading: guildLoading } = useGuild();

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await engagementApi.getDashboardStats();
        setDashboardStats(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || questsLoading || petLoading || bpLoading || guildLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading your dashboard...</div>
      </div>
    );
  }

  const student = {
    username: user?.username || 'Student',
    level: dashboardStats?.level || 1,
    currentXp: dashboardStats?.currentXp || 0,
    xpToNextLevel: dashboardStats?.xpForNextLevel || 100,
    coins: dashboardStats?.coins || 0,
    gems: dashboardStats?.gems || 0,
    streak: dashboardStats?.streak || 0,
    todayProblems: dashboardStats?.todayProblemsSolved || 0,
    todayAccuracy: dashboardStats?.todayAccuracy || 0,
    rank: dashboardStats?.globalRank || 0,
    activePet: pet ? {
      name: pet.name,
      emoji: pet.emoji,
      level: pet.level,
      happiness: pet.happiness
    } : null,
    dailyQuestProgress: {
      completed: quests.filter(q => q.progress >= q.target).length,
      total: quests.length
    },
    battlePassLevel: battlePassData?.currentLevel || 0,
    guildName: guild?.name || null,
    guildRank: members.find(m => m.id === user?.id)?.role || null,
  };

  const progressPercent = (student.currentXp / student.xpToNextLevel) * 100;

  // Quick action buttons
  const quickActions = [
    {
      id: 'play',
      label: 'Play Solo',
      icon: Play,
      gradient: 'from-green-500 to-blue-500',
      route: '/game/solo-play',
      description: 'Solve problems & earn rewards'
    },
    {
      id: 'bosses',
      label: 'Boss Battle',
      icon: Trophy,
      gradient: 'from-red-500 to-orange-500',
      route: '/bosses',
      description: 'Epic boss encounters'
    },
    {
      id: 'story',
      label: 'Story Mode',
      icon: Book,
      gradient: 'from-purple-500 to-pink-500',
      route: '/story',
      description: 'Adventure through worlds'
    },
    {
      id: 'challenges',
      label: 'PvP Arena',
      icon: Swords,
      gradient: 'from-yellow-500 to-red-500',
      route: '/challenges',
      description: 'Battle other players'
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-purple-500',
      route: '/shop',
      description: 'Buy items & power-ups'
    },
    {
      id: 'avatar',
      label: 'Customize',
      icon: User,
      gradient: 'from-pink-500 to-purple-500',
      route: '/avatar',
      description: 'Customize your avatar'
    },
    {
      id: 'homebase',
      label: 'Home Base',
      icon: Home,
      gradient: 'from-green-500 to-teal-500',
      route: '/homebase',
      description: 'Decorate your room'
    },
    {
      id: 'guild',
      label: 'Guild Hall',
      icon: Users,
      gradient: 'from-indigo-500 to-blue-500',
      route: '/guild',
      description: 'Join forces with friends'
    },
  ];

  const stats = [
    {
      label: 'Today\'s Problems',
      value: student.todayProblems,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'from-green-500 to-blue-500'
    },
    {
      label: 'Accuracy',
      value: `${student.todayAccuracy}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Streak',
      value: `${student.streak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'from-orange-500 to-red-500'
    },
    {
      label: 'Global Rank',
      value: `#${student.rank}`,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'from-yellow-500 to-orange-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                Welcome back, {student.username}! 👋
              </h1>
              <p className="text-gray-300 text-lg">Ready to crush some math problems today?</p>
            </div>

            {/* Currency Display */}
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 px-6 py-3 rounded-xl flex items-center gap-3 cursor-pointer"
              >
                <span className="text-3xl">🪙</span>
                <div>
                  <p className="text-xs text-gray-400">Coins</p>
                  <p className="font-black text-yellow-400 text-xl">{student.coins.toLocaleString()}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 px-6 py-3 rounded-xl flex items-center gap-3 cursor-pointer"
              >
                <span className="text-3xl">💎</span>
                <div>
                  <p className="text-xs text-gray-400">Gems</p>
                  <p className="font-black text-blue-400 text-xl">{student.gems.toLocaleString()}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Level Progress Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {student.level}
                </div>
                <div>
                  <h3 className="text-white font-black text-2xl">Level {student.level}</h3>
                  <p className="text-gray-300 text-sm">{student.currentXp.toLocaleString()} / {student.xpToNextLevel.toLocaleString()} XP</p>
                </div>
              </div>

              {/* Active Pet */}
              {student.activePet && (
                <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl">
                  <div className="text-4xl">{student.activePet.emoji}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{student.activePet.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-300">Lvl {student.activePet.level}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-pink-400 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {student.activePet.happiness}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* XP Progress Bar */}
            <div className="relative w-full h-8 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm z-10">
                {progressPercent.toFixed(1)}% to Level {student.level + 1}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-6 text-white shadow-xl`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8 opacity-80" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    ✨
                  </motion.div>
                </div>
                <p className="text-white/80 text-sm font-semibold mb-1">{stat.label}</p>
                <p className="text-4xl font-black">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(action.route)}
                  className={`bg-gradient-to-br ${action.gradient} rounded-2xl p-6 text-white shadow-2xl cursor-pointer group relative overflow-hidden`}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

                  <div className="relative z-10">
                    <Icon className="w-12 h-12 mb-3 mx-auto" />
                    <h3 className="font-black text-lg mb-1">{action.label}</h3>
                    <p className="text-xs text-white/80">{action.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Featured Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Battle Pass Progress */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/battlepass')}
            className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl p-6 text-white cursor-pointer shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="font-black text-2xl">Battle Pass</h3>
                  <p className="text-white/80 text-sm">Season 1: Math Masters</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-black text-3xl">{student.battlePassLevel}</p>
                <p className="text-white/60 text-xs">/ 100</p>
              </div>
            </div>

            <div className="relative w-full h-6 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${student.battlePassLevel}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/60">Next reward at level {student.battlePassLevel + 1}</span>
              <span className="text-yellow-400 font-bold">→</span>
            </div>
          </motion.div>

          {/* Guild Activity */}
          {guild ? (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/guild')}
              className="bg-gradient-to-br from-blue-800 to-indigo-800 rounded-2xl p-6 text-white cursor-pointer shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="font-black text-2xl">{guild.name}</h3>
                    <p className="text-white/80 text-sm">Role: {student.guildRank}</p>
                  </div>
                </div>
                <Award className="w-12 h-12 text-blue-400 opacity-50" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Guild Level</span>
                  <span className="font-bold">{guild.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Members Online</span>
                  <span className="font-bold text-green-400">
                    {members.filter(m => m.isOnline).length} / {guild.maxMembers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Your Contribution</span>
                  <span className="font-bold text-yellow-400">
                    {members.find(m => m.id === user?.id)?.weeklyXp.toLocaleString() || 0} XP
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/guild')}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white cursor-pointer shadow-xl border-2 border-dashed border-gray-600"
            >
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Users className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="font-black text-2xl mb-2">Join a Guild!</h3>
                <p className="text-gray-400 text-sm">Team up with friends and earn exclusive rewards</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Daily Quests Summary */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-green-800 to-teal-800 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="font-black text-2xl">Daily Quests</h3>
                <p className="text-white/80 text-sm">
                  {student.dailyQuestProgress.completed} / {student.dailyQuestProgress.total} completed
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/game/solo-play')}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Complete Quests →
            </motion.button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {quests.slice(0, 3).map((quest, index) => {
              const isCompleted = quest.progress >= quest.target;
              return (
                <div key={quest.id} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm">{quest.name}</p>
                    {isCompleted && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <div className="relative w-full h-3 bg-black/30 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                      style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{quest.progress} / {quest.target}</span>
                    <span className="text-yellow-400 font-bold">
                      {quest.coinReward} 🪙 {quest.gemReward > 0 && `+ ${quest.gemReward} 💎`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default Dashboard;