import { motion } from 'framer-motion';
import { calculateTotalSaved, calculateLongestStreak } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';

export default function DashboardSummaryCards({ addictions = [], currency = 'INR' }) {
  if (!addictions || addictions.length === 0) return null;

  const totalSaved = calculateTotalSaved(addictions);
  const { maxCleanDays, maxCleanVice } = calculateLongestStreak(addictions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
    >
      <div className="glass p-5 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20">
        <p className="text-slate-400 text-sm mb-1">Addictions Tracked</p>
        <p className="font-display font-black text-4xl text-teal-400">{addictions.length}</p>
      </div>
      <div className="glass p-5 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
        <p className="text-slate-400 text-sm mb-1">Total Money Saved</p>
        <p className="font-display font-black text-4xl text-green-400">
          {formatCurrency(totalSaved, currency)}
        </p>
      </div>
      <div className="glass p-5 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
        <p className="text-slate-400 text-sm mb-1 line-clamp-1">
          Longest Clean Streak{' '}
          {maxCleanVice && (
            <span className="text-violet-400 font-medium capitalize">
              ({maxCleanVice.customName || maxCleanVice.viceName})
            </span>
          )}
        </p>
        <p className="font-display font-black text-4xl text-violet-400">
          {maxCleanDays} <span className="text-xl font-normal opacity-70">days</span>
        </p>
      </div>
    </motion.div>
  );
}
