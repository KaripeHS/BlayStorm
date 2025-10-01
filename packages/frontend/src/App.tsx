import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import { useSocketConnection } from './hooks/useSocket';

// Auth pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Game pages
import Home from './pages/game/Home';
import SoloPlay from './pages/game/SoloPlay';
import Multiplayer from './pages/game/Multiplayer';
import GameRoom from './pages/game/GameRoom';
import Dashboard from './pages/Dashboard';

// Engagement pages
import ShopPage from './pages/ShopPage';
import AvatarPage from './pages/AvatarPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import BattlePassPage from './pages/BattlePassPage';
import GuildPage from './pages/GuildPage';
import ChallengesPage from './pages/ChallengesPage';
import HomeBasePage from './pages/HomeBasePage';
import StoryPage from './pages/StoryPage';
import BossesPage from './pages/BossesPage';

// Profile pages
import Profile from './pages/profile/Profile';

// Subscription pages
import Plans from './pages/subscription/Plans';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassroomList from './pages/teacher/ClassroomList';
import CreateClassroom from './pages/teacher/CreateClassroom';
import ClassroomDetail from './pages/teacher/ClassroomDetail';
import CreateAssignment from './pages/teacher/CreateAssignment';
import AssignmentDetail from './pages/teacher/AssignmentDetail';
import Analytics from './pages/teacher/Analytics';

function App() {
  const { user, isLoading } = useAuthStore();

  // Initialize socket connection when user is logged in
  useSocketConnection();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  const isTeacher = user?.role === 'TEACHER';
  const defaultRoute = isTeacher ? '/teacher/dashboard' : '/dashboard';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to={defaultRoute} />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={defaultRoute} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={defaultRoute} />} />

      {/* Protected routes - Students */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
      <Route path="/game/solo-play" element={user ? <SoloPlay /> : <Navigate to="/login" />} />
      <Route path="/solo" element={user ? <SoloPlay /> : <Navigate to="/login" />} />
      <Route path="/multiplayer" element={user ? <Multiplayer /> : <Navigate to="/login" />} />
      <Route path="/room/:roomCode" element={user ? <GameRoom /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/plans" element={user ? <Plans /> : <Navigate to="/login" />} />

      {/* Engagement Features */}
      <Route path="/shop" element={user ? <ShopPage /> : <Navigate to="/login" />} />
      <Route path="/avatar" element={user ? <AvatarPage /> : <Navigate to="/login" />} />
      <Route path="/leaderboards" element={user ? <LeaderboardsPage /> : <Navigate to="/login" />} />
      <Route path="/battlepass" element={user ? <BattlePassPage /> : <Navigate to="/login" />} />
      <Route path="/guild" element={user ? <GuildPage /> : <Navigate to="/login" />} />
      <Route path="/challenges" element={user ? <ChallengesPage /> : <Navigate to="/login" />} />
      <Route path="/homebase" element={user ? <HomeBasePage /> : <Navigate to="/login" />} />
      <Route path="/story" element={user ? <StoryPage /> : <Navigate to="/login" />} />
      <Route path="/bosses" element={user ? <BossesPage /> : <Navigate to="/login" />} />

      {/* Protected routes - Teachers */}
      <Route path="/teacher/dashboard" element={user && isTeacher ? <TeacherDashboard /> : <Navigate to="/login" />} />
      <Route path="/teacher/classrooms" element={user && isTeacher ? <ClassroomList /> : <Navigate to="/login" />} />
      <Route path="/teacher/classrooms/new" element={user && isTeacher ? <CreateClassroom /> : <Navigate to="/login" />} />
      <Route path="/teacher/classrooms/:id" element={user && isTeacher ? <ClassroomDetail /> : <Navigate to="/login" />} />
      <Route path="/teacher/assignments/new" element={user && isTeacher ? <CreateAssignment /> : <Navigate to="/login" />} />
      <Route path="/teacher/assignments/:id" element={user && isTeacher ? <AssignmentDetail /> : <Navigate to="/login" />} />
      <Route path="/teacher/analytics" element={user && isTeacher ? <Analytics /> : <Navigate to="/login" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;