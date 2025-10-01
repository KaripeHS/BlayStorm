import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Star, Trophy, TrendingUp, Shield, Target, Gift, MessageCircle, LogOut, UserPlus, Settings } from 'lucide-react';
import { fireConfetti } from '../effects/ParticleEffects';

interface GuildMember {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  role: 'LEADER' | 'OFFICER' | 'MEMBER';
  weeklyXp: number;
  totalContribution: number;
  joinedAt: Date;
  isOnline: boolean;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  memberCount: number;
  maxMembers: number;
  totalXp: number;
  weeklyXp: number;
  rank: number;
  benefits: string[];
  createdAt: Date;
}

interface GuildEvent {
  id: string;
  name: string;
  description: string;
  type: 'RAID' | 'TOURNAMENT' | 'CHALLENGE' | 'SOCIAL';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  rewards: {
    coins: number;
    gems: number;
    xp: number;
  };
}

interface GuildHallProps {
  guild: Guild;
  members: GuildMember[];
  events: GuildEvent[];
  currentMemberId: string;
  currentMemberRole: 'LEADER' | 'OFFICER' | 'MEMBER';
  onLeaveGuild?: () => Promise<void>;
  onKickMember?: (memberId: string) => Promise<void>;
  onPromoteMember?: (memberId: string) => Promise<void>;
  onDemoteMember?: (memberId: string) => Promise<void>;
  onJoinEvent?: (eventId: string) => Promise<void>;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
}

export const GuildHall: React.FC<GuildHallProps> = ({
  guild,
  members,
  events,
  currentMemberId,
  currentMemberRole,
  onLeaveGuild,
  onKickMember,
  onPromoteMember,
  onDemoteMember,
  onJoinEvent,
  onOpenChat,
  onOpenSettings,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'events' | 'leaderboard'>('overview');
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  const progressPercent = (guild.currentXp / guild.xpForNextLevel) * 100;
  const sortedMembers = [...members].sort((a, b) => b.weeklyXp - a.weeklyXp);

  const getRoleBadge = (role: GuildMember['role']) => {
    switch (role) {
      case 'LEADER':
        return { icon: <Crown className="w-4 h-4" />, color: 'from-yellow-400 to-orange-500', label: 'Leader' };
      case 'OFFICER':
        return { icon: <Shield className="w-4 h-4" />, color: 'from-blue-400 to-purple-500', label: 'Officer' };
      case 'MEMBER':
        return { icon: <Users className="w-4 h-4" />, color: 'from-gray-400 to-gray-500', label: 'Member' };
    }
  };

  const canManageMembers = currentMemberRole === 'LEADER' || currentMemberRole === 'OFFICER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-5xl shadow-2xl">
                {guild.icon}
              </div>
              <div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {guild.name}
                </h1>
                <p className="text-gray-400 text-lg">{guild.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onOpenChat && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </motion.button>
              )}
              {currentMemberRole === 'LEADER' && onOpenSettings && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              )}
              {onLeaveGuild && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLeaveGuild}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Leave
                </motion.button>
              )}
            </div>
          </div>

          {/* Guild Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Guild Rank"
              value={`#${guild.rank}`}
              color="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Members"
              value={`${guild.memberCount}/${guild.maxMembers}`}
              color="from-blue-500 to-purple-500"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              label="Guild Level"
              value={guild.level.toString()}
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Weekly XP"
              value={guild.weeklyXp.toLocaleString()}
              color="from-green-500 to-blue-500"
            />
          </div>

          {/* Level Progress */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">Guild Level {guild.level}</span>
              <span className="text-gray-400 text-sm">
                {guild.currentXp.toLocaleString()} / {guild.xpForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="relative w-full h-6 bg-gray-900 rounded-full overflow-hidden">
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
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview' as const, label: 'Overview', icon: Shield },
            { id: 'members' as const, label: 'Members', icon: Users },
            { id: 'events' as const, label: 'Events', icon: Target },
            { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <OverviewTab key="overview" guild={guild} members={members} />
          )}
          {selectedTab === 'members' && (
            <MembersTab
              key="members"
              members={sortedMembers}
              currentMemberId={currentMemberId}
              canManageMembers={canManageMembers}
              getRoleBadge={getRoleBadge}
              onKickMember={onKickMember}
              onPromoteMember={onPromoteMember}
              onDemoteMember={onDemoteMember}
            />
          )}
          {selectedTab === 'events' && (
            <EventsTab key="events" events={events} onJoinEvent={onJoinEvent} />
          )}
          {selectedTab === 'leaderboard' && (
            <LeaderboardTab
              key="leaderboard"
              members={sortedMembers}
              currentMemberId={currentMemberId}
              getRoleBadge={getRoleBadge}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white`}
  >
    <div className="flex items-center gap-2 mb-2 opacity-90">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <div className="text-2xl font-black">{value}</div>
  </motion.div>
);

interface OverviewTabProps {
  guild: Guild;
  members: GuildMember[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ guild, members }) => {
  const onlineMembers = members.filter(m => m.isOnline).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Guild Benefits */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-400" />
          Guild Benefits
        </h3>
        <div className="space-y-3">
          {guild.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-gray-700 rounded-lg p-3"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
              <span className="text-white">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Online Members</span>
            <span className="text-white font-bold text-xl">{onlineMembers} / {guild.memberCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Weekly XP</span>
            <span className="text-green-400 font-bold text-xl">{guild.weeklyXp.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total XP</span>
            <span className="text-purple-400 font-bold text-xl">{guild.totalXp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-gray-800 rounded-xl p-6 lg:col-span-2">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          Top Contributors This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.slice(0, 3).map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${
                index === 0 ? 'from-yellow-500 to-orange-500' :
                index === 1 ? 'from-gray-400 to-gray-500' :
                'from-orange-400 to-orange-600'
              } rounded-xl p-4 text-white text-center`}
            >
              <div className="text-4xl mb-2">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div className="text-3xl mb-2">{member.avatarUrl || '🧑'}</div>
              <div className="font-bold mb-1">{member.username}</div>
              <div className="text-sm opacity-90">Level {member.level}</div>
              <div className="text-2xl font-black mt-2">{member.weeklyXp.toLocaleString()} XP</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface MembersTabProps {
  members: GuildMember[];
  currentMemberId: string;
  canManageMembers: boolean;
  getRoleBadge: (role: GuildMember['role']) => { icon: React.ReactNode; color: string; label: string };
  onKickMember?: (memberId: string) => Promise<void>;
  onPromoteMember?: (memberId: string) => Promise<void>;
  onDemoteMember?: (memberId: string) => Promise<void>;
}

const MembersTab: React.FC<MembersTabProps> = ({
  members,
  currentMemberId,
  canManageMembers,
  getRoleBadge,
  onKickMember,
  onPromoteMember,
  onDemoteMember,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-2"
  >
    {members.map((member) => {
      const isCurrentUser = member.id === currentMemberId;
      const roleBadge = getRoleBadge(member.role);

      return (
        <motion.div
          key={member.id}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`bg-gray-800 rounded-xl p-4 ${isCurrentUser && 'ring-2 ring-green-400'}`}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`relative w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl ${
              isCurrentUser && 'ring-2 ring-green-400'
            }`}>
              {member.avatarUrl || '🧑'}
              {member.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-bold truncate">
                  {member.username}
                  {isCurrentUser && <span className="text-xs text-green-400 ml-2">(You)</span>}
                </h4>
                <div className={`px-2 py-1 bg-gradient-to-r ${roleBadge.color} rounded-full flex items-center gap-1 text-xs font-bold text-white`}>
                  {roleBadge.icon}
                  {roleBadge.label}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Level {member.level}</span>
                <span>•</span>
                <span className="text-green-400">{member.weeklyXp.toLocaleString()} XP this week</span>
                <span>•</span>
                <span className="text-purple-400">{member.totalContribution.toLocaleString()} Total XP</span>
              </div>
            </div>

            {/* Actions */}
            {canManageMembers && !isCurrentUser && (
              <div className="flex gap-2">
                {member.role === 'MEMBER' && onPromoteMember && (
                  <button
                    onClick={() => onPromoteMember(member.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                  >
                    Promote
                  </button>
                )}
                {member.role === 'OFFICER' && onDemoteMember && (
                  <button
                    onClick={() => onDemoteMember(member.id)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold rounded transition-colors"
                  >
                    Demote
                  </button>
                )}
                {onKickMember && member.role !== 'LEADER' && (
                  <button
                    onClick={() => onKickMember(member.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
                  >
                    Kick
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

interface EventsTabProps {
  events: GuildEvent[];
  onJoinEvent?: (eventId: string) => Promise<void>;
}

const EventsTab: React.FC<EventsTabProps> = ({ events, onJoinEvent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-4"
  >
    {events.map((event) => (
      <EventCard key={event.id} event={event} onJoinEvent={onJoinEvent} />
    ))}
    {events.length === 0 && (
      <div className="col-span-2 text-center py-20 text-gray-500">
        <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No active events</p>
        <p className="text-sm">Check back later for guild events!</p>
      </div>
    )}
  </motion.div>
);

interface EventCardProps {
  event: GuildEvent;
  onJoinEvent?: (eventId: string) => Promise<void>;
}

const EventCard: React.FC<EventCardProps> = ({ event, onJoinEvent }) => {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!onJoinEvent) return;
    setJoining(true);
    try {
      await onJoinEvent(event.id);
    } finally {
      setJoining(false);
    }
  };

  const getEventColor = (type: GuildEvent['type']) => {
    switch (type) {
      case 'RAID': return 'from-red-500 to-orange-500';
      case 'TOURNAMENT': return 'from-purple-500 to-pink-500';
      case 'CHALLENGE': return 'from-blue-500 to-cyan-500';
      case 'SOCIAL': return 'from-green-500 to-blue-500';
    }
  };

  const color = getEventColor(event.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5" />
        <span className="text-xs font-bold uppercase">{event.type}</span>
      </div>

      <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
      <p className="text-sm opacity-90 mb-4">{event.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-75">Participants</span>
          <span className="font-bold">{event.participants} / {event.maxParticipants}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-75">Rewards</span>
          <span className="font-bold">
            {event.rewards.coins} 🪙 • {event.rewards.gems} 💎 • {event.rewards.xp} XP
          </span>
        </div>
      </div>

      {onJoinEvent && (
        <button
          onClick={handleJoin}
          disabled={joining || event.participants >= event.maxParticipants}
          className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {joining ? 'Joining...' : event.participants >= event.maxParticipants ? 'Full' : 'Join Event'}
        </button>
      )}
    </motion.div>
  );
};

interface LeaderboardTabProps {
  members: GuildMember[];
  currentMemberId: string;
  getRoleBadge: (role: GuildMember['role']) => { icon: React.ReactNode; color: string; label: string };
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ members, currentMemberId, getRoleBadge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-2"
  >
    {members.map((member, index) => {
      const isCurrentUser = member.id === currentMemberId;
      const roleBadge = getRoleBadge(member.role);

      return (
        <motion.div
          key={member.id}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.02 }}
          className={`p-4 rounded-xl transition-all ${
            isCurrentUser
              ? 'bg-gradient-to-r from-green-800 to-green-900 border-2 border-green-500'
              : 'bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
              index < 3 ? `bg-gradient-to-br ${
                index === 0 ? 'from-yellow-400 to-orange-500' :
                index === 1 ? 'from-gray-400 to-gray-500' :
                'from-orange-400 to-orange-600'
              } text-white` : 'bg-gray-700 text-gray-400'
            }`}>
              #{index + 1}
            </div>

            {/* Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl ${
              isCurrentUser && 'ring-2 ring-green-400'
            }`}>
              {member.avatarUrl || '🧑'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold truncate ${isCurrentUser ? 'text-green-200' : 'text-white'}`}>
                  {member.username}
                </h4>
                <div className={`px-2 py-0.5 bg-gradient-to-r ${roleBadge.color} rounded-full flex items-center gap-1 text-xs font-bold text-white`}>
                  {roleBadge.icon}
                </div>
              </div>
              <p className="text-xs text-gray-400">Level {member.level}</p>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className={`text-xl font-black ${isCurrentUser ? 'text-green-200' : 'text-yellow-400'}`}>
                {member.weeklyXp.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">XP this week</div>
            </div>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

export default GuildHall;