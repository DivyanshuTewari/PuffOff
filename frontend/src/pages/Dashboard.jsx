import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AddictionCard from '../components/AddictionCard';
import { Plus, ClipboardCheck, TrendingUp, BookOpen, AlertTriangle, Sparkles, Leaf, Activity } from 'lucide-react';
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
  const [rescuerPlanMap, setRescuerPlanMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const fetchAddictions = async () => {
    try {
      const [addRes, rescuerRes] = await Promise.all([
        api.get('/api/addictions'),
        api.get('/api/rescuer').catch(() => ({ data: { plans: [] } })),
      ]);
      setAddictions(addRes.data.addictions);
      // Build map: addictionId -> planId
      const map = {};
      (rescuerRes.data.plans || []).forEach(p => {
        const aid = p.addictionId?._id || p.addictionId;
        map[aid] = p._id;
      });
      setRescuerPlanMap(map);
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

  let maxCleanDays = 0;
  let maxCleanVice = null;
  if (addictions.length > 0) {
    const sorted = [...addictions].sort((a, b) => new Date(a.lastRelapseDate).getTime() - new Date(b.lastRelapseDate).getTime());
    maxCleanVice = sorted[0];
    maxCleanDays = Math.floor((Date.now() - new Date(maxCleanVice.lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  const currencyCode = user?.currency || 'INR';
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

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
            <p className="font-display font-black text-4xl text-green-400">{currencySymbol}{totalSaved}</p>
          </div>
          <div className="glass p-5 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
            <p className="text-slate-400 text-sm mb-1 line-clamp-1">Longest Clean Streak {maxCleanVice && <span className="text-violet-400 font-medium capitalize">({maxCleanVice.customName || maxCleanVice.viceName})</span>}</p>
            <p className="font-display font-black text-4xl text-violet-400">{maxCleanDays} <span className="text-xl font-normal opacity-70">days</span></p>
          </div>
        </motion.div>
      )}

      {/* Daily quote */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass p-5 border border-teal-500/15 mb-8 flex items-start gap-3">
        <Sparkles size={18} className="text-teal-400 mt-0.5 shrink-0" />
        <p className="text-slate-300 italic text-sm leading-relaxed">"{quote}"</p>
      </motion.div>

      {/* The Rescuer — Big CTA Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-5">
        <Link
          to="/rescuer"
          id="dashboard-rescuer-btn"
          className="group relative flex items-center justify-between gap-4 rounded-2xl p-5 overflow-hidden border border-orange-500/25 hover:border-orange-500/50 transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(225,29,72,0.10) 100%)' }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(249,115,22,0.18)' }} />
          <div className="absolute -bottom-6 left-12 w-24 h-24 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(225,29,72,0.12)' }} />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}>
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-white leading-tight">The Rescuer</p>
              <p className="text-orange-200/70 text-sm mt-0.5">Smart tapering engine — quit gradually, not cold turkey</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-xs text-orange-300/70 font-medium">4-Phase Plan</span>
              <div className="flex gap-1">
                {['Phase 1','Phase 2','Phase 3','Freedom'].map((p, i) => (
                  <div key={i} className="w-5 h-1.5 rounded-full" style={{ background: i === 0 ? '#f97316' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-all">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-orange-400" style={{ color: 'inherit' }}/></svg>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
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
            <AddictionCard key={a._id} addiction={a} rescuerPlanId={rescuerPlanMap[a._id] || null} onDelete={fetchAddictions} onRelapse={fetchAddictions} />
          ))}
        </div>
      )}
    </div>
  );
}
