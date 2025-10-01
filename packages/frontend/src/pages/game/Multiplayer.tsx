import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users } from 'lucide-react';

export default function Multiplayer() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    // TODO: Implement room creation with Socket.io
    alert('Multiplayer feature coming soon!');
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      navigate(`/room/${roomCode}`);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-12">Multiplayer Battle</h1>

          <div className="grid gap-6">
            {/* Create Room */}
            <div className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-fire flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Create Room</h2>
                  <p className="text-gray-600">Start a new game and invite friends</p>
                </div>
              </div>
              <button onClick={handleCreateRoom} className="btn-primary w-full">
                Create New Room
              </button>
            </div>

            {/* Join Room */}
            <div className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-storm flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Join Room</h2>
                  <p className="text-gray-600">Enter a room code to join</p>
                </div>
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="input flex-1 text-center text-2xl font-bold tracking-wider"
                  placeholder="ABC123"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={roomCode.length !== 6}
                  className="btn-primary"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}