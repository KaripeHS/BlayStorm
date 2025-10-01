import { Link } from 'react-router-dom';
import { Zap, Users, Trophy, Brain } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-7xl font-extrabold mb-6 animate-float">
            🔥 BlayStorm 🔥
          </h1>
          <p className="text-3xl font-bold mb-4">Storm Through Math with Friends</p>
          <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto">
            The most engaging way for kids to master math. Battle friends, earn rewards, level up!
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn-ghost text-lg px-8 py-4">
              Login
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="card bg-white/10 backdrop-blur-md border border-white/20">
              <Zap className="w-12 h-12 text-brand-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-white/80">Speed challenges and timed battles</p>
            </div>

            <div className="card bg-white/10 backdrop-blur-md border border-white/20">
              <Users className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Multiplayer Fun</h3>
              <p className="text-white/80">Battle friends in real-time</p>
            </div>

            <div className="card bg-white/10 backdrop-blur-md border border-white/20">
              <Trophy className="w-12 h-12 text-brand-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-white/80">XP, coins, gems, and achievements</p>
            </div>

            <div className="card bg-white/10 backdrop-blur-md border border-white/20">
              <Brain className="w-12 h-12 text-brand-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Tutor</h3>
              <p className="text-white/80">Get personalized help anytime</p>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Choose Your Plan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card bg-white text-gray-900">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <p className="text-4xl font-bold mb-4">$0<span className="text-lg">/mo</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 3 problems per day</li>
                  <li>✓ Solo mode only</li>
                  <li>✗ No AI tutor</li>
                  <li>✗ No multiplayer</li>
                </ul>
                <Link to="/register" className="btn-secondary w-full">
                  Start Free
                </Link>
              </div>

              <div className="card bg-gradient-fire text-white animate-pulse-glow">
                <div className="inline-block bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-4">Premium</h3>
                <p className="text-4xl font-bold mb-4">$9.99<span className="text-lg">/mo</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ Unlimited problems</li>
                  <li>✓ All game modes</li>
                  <li>✓ AI tutor access</li>
                  <li>✓ Multiplayer battles</li>
                </ul>
                <Link to="/register" className="btn bg-white text-brand-orange hover:bg-gray-100 w-full">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 BlayStorm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}