import { Banknote, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function TrackerStatsGrid({ stats, currency = 'INR' }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      <div className="glass p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5">
        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
          <Banknote size={13} /> Today
        </div>
        <div className="font-display font-bold text-2xl text-teal-400 mb-1">
          {formatCurrency(stats.daySpend, currency)}
        </div>
        <div className="text-xs text-teal-400/70 flex items-center gap-1">
          <Activity size={12} /> {stats.dayQty || 0} units
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-teal-500/20">
        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
          <Banknote size={13} /> This Week
        </div>
        <div className="font-display font-bold text-2xl text-white mb-1">
          {formatCurrency(stats.weekSpend, currency)}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Activity size={12} /> {stats.weekQty || 0} units
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-teal-500/10">
        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
          <Banknote size={13} /> This Month
        </div>
        <div className="font-display text-xl text-white mb-1">
          {formatCurrency(stats.monthSpend, currency)}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Activity size={12} /> {stats.monthQty || 0} units
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-teal-500/10">
        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
          <Banknote size={13} /> This Year
        </div>
        <div className="font-display text-xl text-white mb-1">
          {formatCurrency(stats.yearSpend, currency)}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Activity size={12} /> {stats.yearQty || 0} units
        </div>
      </div>

      <div className="glass p-4 rounded-2xl border border-amber-500/20">
        <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
          <Banknote size={13} /> Lifetime Total
        </div>
        <div className="font-display text-xl text-amber-400 mb-1">
          {formatCurrency(stats.totalSpend, currency)}
        </div>
        <div className="text-xs text-amber-400/70 flex items-center gap-1">
          <Activity size={12} /> {stats.totalQty || 0} units
        </div>
      </div>
    </div>
  );
}
