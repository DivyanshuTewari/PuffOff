import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw, Banknote, AlertTriangle, Cigarette, Wine, Leaf, Pill, Zap, Dices, Layers, Pencil, Package, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import CleanTimer from './CleanTimer';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VICE_COLORS = {
  nicotine:   { bg: 'from-amber-500/20 to-orange-600/10', border: 'border-amber-500/25', badge: 'bg-amber-500/20 text-amber-300', dot: '#f59e0b' },
  chewing_tobacco: { bg: 'from-orange-500/20 to-amber-600/10', border: 'border-orange-500/25', badge: 'bg-orange-500/20 text-orange-300', dot: '#ea580c' },
  alcohol:    { bg: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-500/25', badge: 'bg-purple-500/20 text-purple-300', dot: '#a78bfa' },
  cannabis:   { bg: 'from-green-500/20 to-emerald-600/10', border: 'border-green-500/25', badge: 'bg-green-500/20 text-green-300', dot: '#4ade80' },
  opioids:    { bg: 'from-red-500/20 to-rose-600/10', border: 'border-red-500/25', badge: 'bg-red-500/20 text-red-300', dot: '#f87171' },
  stimulants: { bg: 'from-blue-500/20 to-indigo-600/10', border: 'border-blue-500/25', badge: 'bg-blue-500/20 text-blue-300', dot: '#60a5fa' },
  gambling:   { bg: 'from-pink-500/20 to-rose-600/10', border: 'border-pink-500/25', badge: 'bg-pink-500/20 text-pink-300', dot: '#f472b6' },
  other:      { bg: 'from-slate-500/20 to-slate-600/10', border: 'border-slate-500/25', badge: 'bg-slate-500/20 text-slate-300', dot: '#94a3b8' },
};

const VICE_ICONS = { nicotine: Cigarette, chewing_tobacco: Package, alcohol: Wine, cannabis: Leaf, opioids: Pill, stimulants: Zap, gambling: Dices, other: Layers };

function moneySaved(dailySpending, lastRelapseDate) {
  const daysSober = (Date.now() - new Date(lastRelapseDate).getTime()) / (1000 * 60 * 60 * 24);
  return (daysSober * dailySpending).toFixed(2);
}

export default function AddictionCard({ addiction, onDelete, onRelapse, rescuerPlanId }) {
  const { user } = useAuth();
  const [confirmRelapse, setConfirmRelapse] = useState(false);
  const [loading, setLoading] = useState(false);
  const c = VICE_COLORS[addiction.viceName] || VICE_COLORS.other;
  const label = addiction.customName || addiction.viceName;
  const saved = moneySaved(addiction.dailySpending, addiction.lastRelapseDate);
  const currencyCode = user?.currency || addiction.currency || 'INR';
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  const handleRelapse = async () => {
    setLoading(true);
    try {
      await api.post(`/api/addictions/${addiction._id}/relapse`, { note: 'Manual relapse log' });
      toast.success('Relapse logged. It\'s okay — every day is a new start 💙');
      onRelapse();
    } catch {
      toast.error('Failed to log relapse');
    } finally {
      setLoading(false);
      setConfirmRelapse(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/addictions/${addiction._id}`);
      toast.success('Tracking removed');
      onDelete();
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-hover bg-gradient-to-br ${c.bg} border ${c.border} p-5 relative overflow-hidden`}
    >
      {/* Glow orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: c.dot }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 text-slate-300">
            {(() => {
              const IconComponent = VICE_ICONS[addiction.viceName] || VICE_ICONS.other;
              return <IconComponent size={24} strokeWidth={1.5} />;
            })()}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white capitalize">{label}</h3>
            <span className={`badge ${c.badge} capitalize`}>{addiction.viceName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/edit-vice/${addiction._id}`} state={{ addiction }} className="relative z-10 p-1.5 text-slate-500 hover:text-teal-400 rounded-lg hover:bg-teal-500/10 transition-all" title="Edit Vice">
            <Pencil size={15} />
          </Link>
          <button onClick={handleDelete} className="relative z-10 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" title="Delete Vice">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-4">
        <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">Clean Time</p>
        <CleanTimer lastRelapseDate={addiction.lastRelapseDate} />
      </div>

      {/* Money saved */}
      {addiction.dailySpending > 0 && (
        <div className="flex items-center gap-2 mb-4 glass px-3 py-2">
          <Banknote size={14} className="text-green-400" />
          <span className="text-sm text-slate-300">
            <span className="font-bold text-green-400">{currencySymbol}{saved}</span>
            <span className="text-slate-500"> saved so far</span>
          </span>
        </div>
      )}

      {/* Motivational note */}
      {addiction.motivationalNote && (
        <p className="text-slate-400 text-xs italic mb-4 border-l-2 border-teal-500/40 pl-2">
          "{addiction.motivationalNote}"
        </p>
      )}

      {/* Rescuer CTA */}
      {rescuerPlanId ? (
        <Link
          to={`/rescuer/${rescuerPlanId}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-teal-400 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/35 transition-all mb-2"
        >
          <Activity size={13} /> Go to Rescuer →
        </Link>
      ) : (
        <Link
          to={`/rescuer/start/${addiction._id}`}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-orange-400 hover:bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/35 transition-all mb-2"
        >
          <Activity size={13} /> Set up Rescuer →
        </Link>
      )}

      {/* Relapse button */}
      {!confirmRelapse ? (
        <button onClick={() => setConfirmRelapse(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all">
          <RefreshCw size={13} /> Log a relapse
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleRelapse} disabled={loading}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
            <AlertTriangle size={12} /> {loading ? 'Logging...' : 'Confirm Relapse'}
          </button>
          <button onClick={() => setConfirmRelapse(false)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:bg-white/10 transition-all">
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}
