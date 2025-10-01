import { BattlePass } from '../components/engagement/BattlePass';
import { useBattlePass } from '../hooks/useEngagement';

const BattlePassPage = () => {
  const { battlePassData, rewards, loading, claimReward } = useBattlePass();

  if (loading || !battlePassData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading Battle Pass...</div>
      </div>
    );
  }

  return (
    <BattlePass
      battlePassData={battlePassData}
      rewards={rewards}
      onClaimReward={claimReward}
    />
  );
};

export default BattlePassPage;
