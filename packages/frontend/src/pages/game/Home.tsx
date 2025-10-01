import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { Zap, Users, Target, Trophy, LogOut } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const studentProfile = user?.studentProfile;

  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">🔥 BlayStorm</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-white hover:text-brand-gold transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-fire flex items-center justify-center text-white font-bold">
                  {user?.profile?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="font-semibold">{user?.profile?.displayName}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="text-white hover:text-red-300 transition-colors">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="card bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-fire flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold">{studentProfile?.currentLevel || 1}</p>
              </div>
            </div>
          </div>

          <div className="card bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-victory flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">XP</p>
                <p className="text-2xl font-bold">{studentProfile?.totalXp || 0}</p>
              </div>
            </div>
          </div>

          <div className="card bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-storm flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold">{studentProfile?.currentStreak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="card bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coins</p>
                <p className="text-2xl font-bold">{studentProfile?.coins || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Your Mode</h2>

          <div className="grid gap-6">
            {/* Solo Play */}
            <Link to="/solo" className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-fire flex items-center justify-center">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Solo Practice</h3>
                  <p className="text-gray-600">Master math at your own pace</p>
                </div>
                <div className="text-brand-orange font-bold text-xl">→</div>
              </div>
            </Link>

            {/* Multiplayer */}
            <Link to="/multiplayer" className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-storm flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Multiplayer Battle</h3>
                  <p className="text-gray-600">Challenge friends in real-time</p>
                </div>
                <div className="text-brand-blue font-bold text-xl">→</div>
              </div>
            </Link>

            {/* Speed Challenge */}
            <div className="card bg-gray-100 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-victory flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Speed Challenge</h3>
                  <p className="text-gray-600">Coming soon!</p>
                </div>
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {studentProfile && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="card">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Level {studentProfile.currentLevel}</span>
                <span className="text-sm text-gray-600">
                  {studentProfile.totalXp} / {studentProfile.xpToNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-fire transition-all duration-500"
                  style={{
                    width: `${(studentProfile.totalXp / studentProfile.xpToNextLevel) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}