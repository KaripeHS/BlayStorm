import { useState, useEffect } from 'react';
import { ChallengeArena } from '../components/engagement/ChallengeArena';
import { useChallenges } from '../hooks/useEngagement';
import { useAuthStore } from '../stores/auth-store';
import engagementApi from '../services/api/engagement';

const ChallengesPage = () => {
  const { user } = useAuthStore();
  const { activeChallenges, pendingChallenges, completedChallenges, loading, acceptChallenge, declineChallenge } = useChallenges();
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const stats = await engagementApi.getDashboardStats();
        setStudentData(stats);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      }
    };

    fetchStudentData();
  }, []);

  if (loading || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Challenge Arena...</div>
      </div>
    );
  }

  const handleStartChallenge = (challengeId: string) => {
    console.log('Starting challenge:', challengeId);
    // TODO: Navigate to challenge game room
  };

  return (
    <ChallengeArena
      currentStudentId={user?.id || ''}
      currentStudentName={user?.username || 'Student'}
      currentStudentLevel={studentData.level || 1}
      currentStudentCoins={studentData.coins || 0}
      currentStudentGems={studentData.gems || 0}
      activeChallenges={activeChallenges}
      completedChallenges={completedChallenges}
      pendingChallenges={pendingChallenges}
      onAcceptChallenge={acceptChallenge}
      onDeclineChallenge={declineChallenge}
      onStartChallenge={handleStartChallenge}
    />
  );
};

export default ChallengesPage;
