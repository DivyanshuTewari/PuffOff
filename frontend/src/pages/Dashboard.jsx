import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AddictionCard from '../components/AddictionCard';
import { Plus, ClipboardCheck, TrendingUp, BookOpen, AlertTriangle, Sparkles, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const quickLinks = [
  { to: '/checkin',    label: 'Daily Check-in',  icon: ClipboardCheck, color: 'text-teal-400',   bg: 'hover:bg-teal-500/10' },
  { to: '/milestones', label: 'Milestones',       icon: TrendingUp,    color: 'text-violet-400', bg: 'hover:bg-violet-500/10' },
  { to: '/journal',    label: 'Journal',          icon: BookOpen,      color: 'text-blue-400',   bg: 'hover:bg-blue-500/10' },
  { to: '/emergency',  label: 'Emergency Help',   icon: AlertTriangle, color: 'text-amber-400',  bg: 'hover:bg-amber-500/10' },
];

const motivationalQuotes = [
  "Every moment clean is a testament to your incredible strength.",
  "You didn't come this far to only come this far.",
  "The cravings you resist today build the life you love tomorrow.",
  "Recovery is not a race. You don't have to feel guilty if it takes time.",
  "Your only job right now is to not use. Everything else can wait.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [addictions, setAddictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const fetchAddictions = async () => {
    try {
      const res = await api.get('/api/addictions');
      setAddictions(res.data.addictions);
    } catch {
      toast.error('Failed to load your tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddictions(); }, []);

  const totalSaved = addictions.reduce((acc, a) => {
    const days = (Date.now() - new Date(a.lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24);
    return acc + (days * a.dailySpending);
  }, 0).toFixed(2);

  const totalDays = addictions.reduce((acc, a) => {
    return acc + Math.floor((Date.now() - new Date(a.lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24));
  }, 0);

  return (
    <div className="page">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-1">
              Hey, <span className="text-gradient">{user?.username}</span> 👋
            </h1>
            <p className="text-slate-400">Here's your recovery overview for today.</p>
          </div>
          <Link to="/add-vice" id="dashboard-add-vice" className="btn-primary">
            <Plus size={16} /> Track New Vice
          </Link>
        </div>
      </motion.div>

      {/* Summary cards */}
      {addictions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass p-5 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20">
            <p className="text-slate-400 text-sm mb-1">Addictions Tracked</p>
            <p className="font-display font-black text-4xl text-teal-400">{addictions.length}</p>
          </div>
          <div className="glass p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
            <p className="text-slate-400 text-sm mb-1">Total Money Saved</p>
            <p className="font-display font-black text-4xl text-green-400">${totalSaved}</p>
          </div>
          <div className="glass p-5 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
            <p className="text-slate-400 text-sm mb-1">Total Clean Days</p>
            <p className="font-display font-black text-4xl text-violet-400">{totalDays}</p>
          </div>
        </motion.div>
      )}

      {/* Daily quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass p-5 border border-teal-500/15 mb-8 flex items-start gap-3">
        <Sparkles size={18} className="text-teal-400 mt-0.5 shrink-0" />
        <p className="text-slate-300 italic text-sm leading-relaxed">"{quote}"</p>
      </motion.div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickLinks.map(({ to, label, icon: Icon, color, bg }) => (
          <Link key={to} to={to}
            className={`glass flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 ${bg} border border-white/5 hover:border-white/10`}>
            <Icon size={22} className={color} />
            <span className="text-sm font-medium text-slate-300">{label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Addictions grid */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-white">Your Vices</h2>
        {addictions.length > 0 && <Link to="/add-vice" className="text-teal-400 text-sm hover:text-teal-300">+ Add more</Link>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : addictions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass text-center py-20 border border-dashed border-white/10">
          <Leaf size={48} className="mx-auto text-teal-500/50 mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No vices tracked yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add your first addiction to start tracking your clean time and savings.</p>
          <Link to="/add-vice" className="btn-primary mx-auto">
            <Plus size={16} /> Add Your First Vice
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {addictions.map(a => (
            <AddictionCard key={a._id} addiction={a} onDelete={fetchAddictions} onRelapse={fetchAddictions} />
          ))}
        </div>
      )}
    </div>
  );
}
