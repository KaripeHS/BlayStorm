import { GuildHall } from '../components/engagement/GuildHall';
import { useGuild } from '../hooks/useEngagement';
import { useAuthStore } from '../stores/auth-store';

const GuildPage = () => {
  const { user } = useAuthStore();
  const { guild, members, events, loading } = useGuild();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Guild Hall...</div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">You're not in a guild yet!</h1>
          <p className="text-gray-300 mb-8">Join a guild to team up with friends and earn exclusive rewards</p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform">
            Browse Guilds
          </button>
        </div>
      </div>
    );
  }

  const currentMember = members.find(m => m.id === user?.id);

  return (
    <GuildHall
      guild={guild}
      members={members}
      events={events}
      currentMemberId={user?.id || ''}
      currentMemberRole={currentMember?.role || 'MEMBER'}
    />
  );
};

export default GuildPage;
