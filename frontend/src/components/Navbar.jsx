import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ClipboardCheck, TrendingUp,
  AlertTriangle, BookOpen, Plus, LogOut, Menu, X, Flame, Activity, User
} from 'lucide-react';

const nav = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/tracker',    label: 'Tracker',    icon: Activity },
  { to: '/checkin',    label: 'Check-in',   icon: ClipboardCheck },
  { to: '/milestones', label: 'Milestones', icon: TrendingUp },
  { to: '/journal',    label: 'Journal',    icon: BookOpen },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('See you soon! Keep going 💪');
    navigate('/');
  };

  const active = (to) => location.pathname === to;

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-t-0 border-l-0 border-r-0 rounded-none border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">PuffOff</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active(to)
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link to="/emergency"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active('/emergency')
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/8'
              }`}>
              <AlertTriangle size={15} />
              Emergency
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/add-vice" className="hidden md:flex btn-primary text-sm py-2 px-4">
              <Plus size={15} /> Add Vice
            </Link>
            <Link to="/profile" className="hidden md:flex items-center gap-2 glass px-3 py-1.5 hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 overflow-hidden flex items-center justify-center text-xs font-bold text-white relative">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.[0]?.toUpperCase()
                )}
              </div>
              <span className="text-sm text-slate-300 font-medium">{user?.username}</span>
            </Link>
            <button onClick={handleLogout}
              className="hidden md:flex p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
              <LogOut size={17} />
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden glass rounded-none border-t-0 border-l-0 border-r-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {[...nav, { to: '/emergency', label: 'Emergency', icon: AlertTriangle }].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active(to) ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon size={17} /> {label}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-1"></div>
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <User size={17} /> Profile
              </Link>
              <Link to="/add-vice" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-teal-400 hover:bg-teal-500/10 transition-all">
                <Plus size={17} /> Add Vice
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left">
                <LogOut size={17} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
