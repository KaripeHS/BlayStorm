import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export default function Plans() {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // TODO: Implement Stripe checkout
    alert('Stripe integration coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-brand">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => navigate('/profile')} className="btn-ghost text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-white mb-12">
            <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl">Unlock unlimited learning potential</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>3 problems per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Solo mode only</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="w-5 h-5">×</span>
                  <span>No AI tutor</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="w-5 h-5">×</span>
                  <span>No multiplayer</span>
                </li>
              </ul>
              <button className="btn-secondary w-full" disabled>
                Current Plan
              </button>
            </div>

            {/* Premium */}
            <div className="card border-4 border-brand-orange relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <p className="text-4xl font-bold mb-6">
                $9.99<span className="text-lg text-gray-600">/mo</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Unlimited problems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>All game modes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>AI tutor access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Multiplayer battles</span>
                </li>
              </ul>
              <button onClick={handleUpgrade} className="btn-primary w-full">
                Start Free Trial
              </button>
            </div>

            {/* Family */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-4">Family</h3>
              <p className="text-4xl font-bold mb-6">
                $19.99<span className="text-lg text-gray-600">/mo</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Up to 5 student accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Parent dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Progress reports</span>
                </li>
              </ul>
              <button onClick={handleUpgrade} className="btn-primary w-full">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}