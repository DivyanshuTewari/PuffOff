import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AddVicePage from './pages/AddVicePage';
import CheckInPage from './pages/CheckInPage';
import MilestonesPage from './pages/MilestonesPage';
import EmergencyPage from './pages/EmergencyPage';
import JournalPage from './pages/JournalPage';
import TrackerPage from './pages/TrackerPage';
import ProfilePage from './pages/ProfilePage';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center mesh-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
      <p className="text-slate-400 text-sm">Loading PuffOff...</p>
    </div>
  </div>
);

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen mesh-bg">
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      {user && <Navbar />}
      <Routes>
        <Route path="/"           element={<Public><LandingPage /></Public>} />
        <Route path="/login"      element={<Public><LoginPage /></Public>} />
        <Route path="/register"   element={<Public><RegisterPage /></Public>} />
        <Route path="/dashboard"  element={<Private><Dashboard /></Private>} />
        <Route path="/add-vice"   element={<Private><AddVicePage /></Private>} />
        <Route path="/edit-vice/:id" element={<Private><AddVicePage /></Private>} />
        <Route path="/checkin"    element={<Private><CheckInPage /></Private>} />
        <Route path="/milestones" element={<Private><MilestonesPage /></Private>} />
        <Route path="/emergency"  element={<Private><EmergencyPage /></Private>} />
        <Route path="/journal"    element={<Private><JournalPage /></Private>} />
        <Route path="/tracker"    element={<Private><TrackerPage /></Private>} />
        <Route path="/profile"    element={<Private><ProfilePage /></Private>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
