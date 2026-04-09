import { motion } from 'framer-motion';
import { IndianRupee, TrendingDown, ShoppingBag } from 'lucide-react';

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };

// Real-world equivalents (in INR, scaled for other currencies)
const EQUIVALENTS_INR = [
  { min: 20, max: 50, label: 'a chocolate bar 🍫' },
  { min: 50, max: 100, label: 'a chai and samosa ☕' },
  { min: 100, max: 200, label: 'a nice lunch 🍛' },
  { min: 200, max: 350, label: 'a movie ticket 🎬' },
  { min: 350, max: 500, label: 'a book 📚' },
  { min: 500, max: 800, label: 'a pizza 🍕' },
  { min: 800, max: 1500, label: 'a nice dinner out 🍽️' },
  { min: 1500, max: 3000, label: 'an outfit 👕' },
  { min: 3000, max: Infinity, label: 'a weekend trip! ✈️' },
];

function getEquivalent(amount, currency) {
  // Rough conversion rates to INR
  const rates = { INR: 1, USD: 83, EUR: 90, GBP: 105, CAD: 62, AUD: 55 };
  const inINR = amount * (rates[currency] || 1);
  return EQUIVALENTS_INR.find(e => inINR >= e.min && inINR < e.max)?.label || null;
}

export default function RescuerSavingsCard({ plan }) {
  if (!plan) return null;

  const { logs, weeklySchedule, pricePerUnit, currency, unit, baselineDaily } = plan;
  const sym = CURRENCY_SYMBOLS[currency] || currency;

  // Today's log
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayLog = logs?.find(l => {
    const d = new Date(l.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const todayIdx = weeklySchedule?.findIndex(s => {
    const d = new Date(s.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }) ?? -1;
  const todayTarget = todayIdx >= 0 ? weeklySchedule[todayIdx].target : plan.currentDailyTarget;
  const todayConsumed = todayLog?.consumed ?? 0;

  // Units skipped today vs baseline
  const skippedToday = Math.max(0, baselineDaily - todayConsumed);
  const savedToday = skippedToday * pricePerUnit;

  // Weekly savings
  const weekStart = new Date(plan.weekStartDate);
  weekStart.setUTCHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const weeklyLogs = (logs || []).filter(l => {
    const d = new Date(l.date);
    return d >= weekStart && d < weekEnd;
  });
  const weeklyConsumed = weeklyLogs.reduce((sum, l) => sum + (l.consumed || 0), 0);
  // Only count logged days — not future unlogged days (avoids inflated savings)
  const weeklySkipped = Math.max(0, weeklyLogs.length * baselineDaily - weeklyConsumed);
  const savedWeekly = weeklySkipped * pricePerUnit;

  const equivalent = getEquivalent(savedWeekly, currency);

  if (pricePerUnit === 0) return null; // no savings data

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
          <TrendingDown size={16} className="text-green-400" />
        </div>
        <h3 className="font-semibold text-white">Rescuer Savings</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/4 rounded-xl p-3 border border-white/5">
          <p className="text-slate-400 text-xs mb-1">Saved Today</p>
          <p className="font-display font-black text-2xl text-green-400">
            {sym}{savedToday.toFixed(0)}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">{skippedToday} {unit} skipped</p>
        </div>
        <div className="bg-white/4 rounded-xl p-3 border border-white/5">
          <p className="text-slate-400 text-xs mb-1">This Week</p>
          <p className="font-display font-black text-2xl text-emerald-400">
            {sym}{savedWeekly.toFixed(0)}
          </p>
          {equivalent && (
            <p className="text-slate-500 text-xs mt-0.5">≈ {equivalent}</p>
          )}
        </div>
      </div>

      {savedToday > 0 && (
        <div className="flex items-start gap-2 bg-green-500/8 rounded-xl p-3 border border-green-500/15">
          <ShoppingBag size={14} className="text-green-400 mt-0.5 shrink-0" />
          <p className="text-green-300 text-xs leading-relaxed">
            By skipping {skippedToday} {unit} today, you've saved {sym}{savedToday.toFixed(0)}.
            {equivalent && ` Weekly total: ${sym}${savedWeekly.toFixed(0)} (Enough for ${equivalent})`}
          </p>
        </div>
      )}
    </motion.div>
  );
}
