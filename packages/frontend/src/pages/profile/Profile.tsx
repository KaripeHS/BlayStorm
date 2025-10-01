import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { ArrowLeft, Award, Clock, Target } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentProfile = user?.studentProfile;

  return (
    <div className="min-h-screen bg-gradient-brand">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => navigate('/home')} className="btn-ghost text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-fire flex items-center justify-center text-white text-4xl font-bold">
                {user?.profile?.displayName?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.profile?.displayName}</h1>
                <p className="text-gray-600">@{user?.profile?.username}</p>
                <div className="flex gap-4 mt-2">
                  <span className="px-3 py-1 bg-gradient-fire text-white rounded-full text-sm font-semibold">
                    Level {studentProfile?.currentLevel}
                  </span>
                  <span className="px-3 py-1 bg-gradient-victory text-white rounded-full text-sm font-semibold">
                    {studentProfile?.totalXp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-brand-orange" />
                <h3 className="font-semibold">Problems Solved</h3>
              </div>
              <p className="text-3xl font-bold">{studentProfile?.totalProblems || 0}</p>
              <p className="text-sm text-green-600">
                {studentProfile?.totalCorrect || 0} correct
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-brand-blue" />
                <h3 className="font-semibold">Time Spent</h3>
              </div>
              <p className="text-3xl font-bold">{studentProfile?.totalTimeSpent || 0}</p>
              <p className="text-sm text-gray-600">minutes</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-brand-purple" />
                <h3 className="font-semibold">Accuracy</h3>
              </div>
              <p className="text-3xl font-bold">{studentProfile?.averageAccuracy.toFixed(1) || 0}%</p>
            </div>
          </div>

          {/* Subscription */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Subscription</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-semibold">Free Plan</p>
                <p className="text-gray-600">3 problems per day</p>
              </div>
              <Link to="/plans" className="btn-primary">
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}