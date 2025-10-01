import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function GameRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Connect to Socket.io and join room
    console.log('Joining room:', roomCode);
  }, [roomCode]);

  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
      <div className="card max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Room: {roomCode}</h1>
        <p className="text-gray-600 mb-6">Multiplayer game room - Coming soon!</p>
        <button onClick={() => navigate('/multiplayer')} className="btn-primary">
          Leave Room
        </button>
      </div>
    </div>
  );
}