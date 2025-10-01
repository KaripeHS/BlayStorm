import { useState } from 'react';
import { Leaderboards } from '../components/engagement/Leaderboards';
import { useLeaderboard } from '../hooks/useEngagement';
import { useAuthStore } from '../stores/auth-store';

const LeaderboardsPage = () => {
  const { user } = useAuthStore();
  const [type, setType] = useState<'XP' | 'PROBLEMS_SOLVED' | 'STREAK' | 'ACCURACY' | 'COMBO' | 'SPEED'>('XP');
  const [scope, setScope] = useState<'GLOBAL' | 'SCHOOL' | 'CLASS' | 'GRADE' | 'FRIENDS'>('GLOBAL');

  const { entries, loading } = useLeaderboard(type, scope);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading leaderboards...</div>
      </div>
    );
  }

  // Find current student's rank
  const currentStudentRank = entries.findIndex(e => e.studentId === user?.id) + 1;

  // Group all leaderboard types
  const leaderboards = {
    XP: type === 'XP' ? entries : [],
    PROBLEMS_SOLVED: type === 'PROBLEMS_SOLVED' ? entries : [],
    STREAK: type === 'STREAK' ? entries : [],
    ACCURACY: type === 'ACCURACY' ? entries : [],
    COMBO: type === 'COMBO' ? entries : [],
    SPEED: type === 'SPEED' ? entries : [],
  };

  return (
    <Leaderboards
      currentStudentId={user?.id || ''}
      currentStudentRank={currentStudentRank}
      leaderboards={leaderboards}
      scope={scope}
      onScopeChange={setScope}
    />
  );
};

export default LeaderboardsPage;
