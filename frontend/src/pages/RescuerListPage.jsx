import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { Activity, Plus, ChevronRight, Flame, TrendingDown, CheckCircle2, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PHASES = {
  1: { label: 'Stabilization', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/25' },
  2: { label: 'Active Reduction', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/25' },
  3: { label: 'Critical Minimum', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
  4: { label: 'Freedom 🏆', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/25' },
};

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };

export default function RescuerListPage() {
  const [plans, setPlans] = useState([]);
  const [addictions, setAddictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/rescuer'),
      api.get('/api/addictions'),
    ]).then(([plansRes, addRes]) => {
      setPlans(plansRes.data.plans || []);
      setAddictions(addRes.data.addictions || []);
    }).catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  const [planToDelete, setPlanToDelete] = useState(null);

  const executeDelete = async () => {
    if (!planToDelete) return;
    try {
      await api.delete(`/api/rescuer/${planToDelete}`);
      setPlans(prev => prev.filter(p => p._id !== planToDelete));
      toast.success('Plan deleted successfully');
    } catch (err) {
      toast.error('Failed to delete plan');
    } finally {
      setPlanToDelete(null);
    }
  };

  // Addictions without an active rescuer plan
  const plannedIds = new Set(plans.map(p => p.addictionId?._id || p.addictionId));
  const unplanned = addictions.filter(a => !plannedIds.has(a._id));

  return (
    <div className="page max-w-3xl">
      <AnimatePresence>
        {planToDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass w-full max-w-sm rounded-3xl p-6 border border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto border border-red-500/20">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-center text-white mb-2">Delete Plan?</h3>
              <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
                Are you sure you want to delete this tapering plan? Your logs and progress for this plan will be permanently lost.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPlanToDelete(null)} className="btn-outline flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={executeDelete} className="flex-1 justify-center px-4 py-2.5 rounded-xl border border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-white">The Rescuer</h1>
                <p className="text-slate-400 text-sm">Smart Tapering Engine</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2 max-w-lg">
              Gradual, shame-free reduction — guided by science. Not "quit cold turkey." <em>Taper smart.</em>
            </p>
          </div>
          <Link to="/add-vice" className="btn-primary shrink-0 mt-2 sm:mt-0">
            <Plus size={16} /> Track New Vice
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active Plans */}
            {plans.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold text-lg text-white mb-4">Active Plans</h2>
                <div className="space-y-3">
                  {plans.map(plan => {
                    const phase = PHASES[plan.currentPhase] || PHASES[1];
                    const sym = CURRENCY_SYMBOLS[plan.currency] || '₹';

                    // Today's stats
                    const today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    const todayLog = plan.logs?.find(l => {
                      const d = new Date(l.date);
                      d.setUTCHours(0, 0, 0, 0);
                      return d.getTime() === today.getTime();
                    });
                    const consumed = todayLog?.consumed ?? null;

                    // Weekly savings
                    const weekStart = new Date(plan.weekStartDate);
                    weekStart.setUTCHours(0, 0, 0, 0);
                    const weeklyLogs = (plan.logs || []).filter(l => new Date(l.date) >= weekStart);
                    const weeklyConsumed = weeklyLogs.reduce((s, l) => s + (l.consumed || 0), 0);
                    // Only count logged days for savings — not future unlogged days
                    const weeklySkipped = Math.max(0, weeklyLogs.length * plan.baselineDaily - weeklyConsumed);
                    const savedWeekly = weeklySkipped * (plan.pricePerUnit || 0);

                    return (
                      <Link key={plan._id} to={`/rescuer/${plan._id}`}
                        className="glass rounded-2xl p-5 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all flex items-center gap-4 group block"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-semibold text-white capitalize">
                              {plan.addictionId?.customName || plan.addictionId?.viceName?.replace('_', ' ') || 'Vice'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${phase.bg} ${phase.color}`}>
                              Phase {plan.currentPhase} — {phase.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="text-slate-400">
                              Target: <span className="text-white font-semibold">{plan.currentDailyTarget}</span>/{plan.baselineDaily} {plan.unit}
                            </span>
                            {consumed !== null && (
                              <span className={consumed <= plan.currentDailyTarget ? 'text-teal-400' : 'text-red-400'}>
                                {consumed <= plan.currentDailyTarget ? '✓' : '!'} {consumed} today
                              </span>
                            )}
                            {plan.pricePerUnit > 0 && savedWeekly > 0 && (
                              <span className="text-green-400">↑ {sym}{savedWeekly.toFixed(0)} saved</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPlanToDelete(plan._id);
                          }}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4 z-10 shrink-0"
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-teal-400 transition-colors shrink-0 ml-1" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Start Rescuer for unplanned vices */}
            {unplanned.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold text-lg text-white mb-4">
                  {plans.length > 0 ? 'Start Rescuer for More Vices' : 'Start Your First Plan'}
                </h2>
                <div className="space-y-3">
                  {unplanned.map(a => (
                    <Link
                      key={a._id}
                      to={`/rescuer/start/${a._id}`}
                      className="glass rounded-2xl p-4 border border-dashed border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-orange-500/30 transition-all">
                        <TrendingDown size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-300 capitalize group-hover:text-white transition-colors">
                          {a.customName || a.viceName?.replace('_', ' ')}
                        </p>
                        <p className="text-slate-500 text-xs">Tap to start a tapering plan</p>
                      </div>
                      <Plus size={15} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {plans.length === 0 && addictions.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-10 text-center border border-dashed border-white/10"
              >
                <Flame size={48} className="mx-auto text-orange-500/40 mb-4" />
                <h3 className="font-display font-bold text-xl text-white mb-2">No vices tracked yet</h3>
                <p className="text-slate-400 text-sm mb-6">Add a vice first, then come back to set up your Rescuer plan.</p>
                <Link to="/add-vice" className="btn-primary mx-auto">
                  <Plus size={15} /> Track a Vice First
                </Link>
              </motion.div>
            )}



          </>
        )}
      </motion.div>
    </div>
  );
}
