import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import {
  Activity, ArrowLeft, Flame, CheckCircle, AlertTriangle,
  Plus, Minus, Bell, Shield, Settings, ChevronRight,
  Zap, Heart, TrendingUp, Clock, RotateCcw, Map, Pencil
} from 'lucide-react';
import UrgeCooldownTimer from '../components/UrgeCooldownTimer';
import StaircaseChart from '../components/StaircaseChart';
import PeakTimeAlert from '../components/PeakTimeAlert';
import RescuerSavingsCard from '../components/RescuerSavingsCard';

// ── Phase config ──────────────────────────────────────────────────────────────
const PHASES = {
  1: {
    label: 'Stabilization',
    desc: 'Week 1 — Time Shifting. Breaking your routine.',
    color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30',
    gradientFrom: '#0ea5e9', gradientTo: '#6366f1',
  },
  2: {
    label: 'Active Reduction',
    desc: 'Weeks 2-4 — Cutting 1-2 units per week.',
    color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30',
    gradientFrom: '#14b8a6', gradientTo: '#22c55e',
  },
  3: {
    label: 'Critical Minimum',
    desc: 'Intermittent Days — Skipping every other day.',
    color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30',
    gradientFrom: '#8b5cf6', gradientTo: '#ec4899',
  },
  4: {
    label: 'Freedom',
    desc: 'Maintenance & Relapse Prevention.',
    color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30',
    gradientFrom: '#22c55e', gradientTo: '#10b981',
  },
};

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Notification permission request
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export default function RescuerDashboardPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logInput, setLogInput] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [showExtraModal, setShowExtraModal] = useState(false);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await api.get(`/api/rescuer/plan/${planId}`);
      setPlan(res.data.plan);
      
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tLog = res.data.plan.logs?.find(l => {
        const d = new Date(l.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      if (tLog && tLog.consumed > 0) {
        setLogInput(String(tLog.consumed));
      }
    } catch (err) {
      toast.error('Could not load plan');
      navigate('/rescuer');
    } finally {
      setLoading(false);
    }
  }, [planId, navigate]);

  useEffect(() => {
    fetchPlan();
    requestNotificationPermission();
  }, [fetchPlan]);

  // ── Derived state ────────────────────────────────────────────────────────
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const todayIdx = plan?.weeklySchedule?.findIndex(s => {
    const d = new Date(s.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }) ?? -1;

  const todaySchedule = todayIdx >= 0 ? plan?.weeklySchedule[todayIdx] : null;
  const todayTarget = todaySchedule?.target ?? plan?.currentDailyTarget ?? 0;
  const isIntermittentOff = todaySchedule?.isIntermittent === true;

  const todayLog = plan?.logs?.find(l => {
    const d = new Date(l.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const todayConsumed = todayLog?.consumed ?? 0;
  const urgesResisted = todayLog?.urgeResisted ?? 0;

  const progressPct = todayTarget > 0 ? Math.min(1, todayConsumed / todayTarget) : 0;
  const isOnTarget = todayConsumed <= todayTarget;
  const phase = plan ? PHASES[plan.currentPhase] ?? PHASES[1] : PHASES[1];
  const viceName = plan?.addictionId?.viceName || 'other';
  const viceLabel = plan?.addictionId?.customName || plan?.addictionId?.viceName || 'Vice';
  const sym = CURRENCY_SYMBOLS[plan?.currency] || '₹';

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogDay = async () => {
    const qty = Number(logInput);
    if (!qty && qty !== 0) { toast.error('Enter a valid quantity'); return; }
    setLogging(true);
    try {
      const res = await api.post(`/api/rescuer/${planId}/log`, { consumed: qty });
      setPlan(res.data.plan);
      toast.success(qty <= todayTarget ? '✅ Logged! Well done!' : '📝 Logged and plan adjusted.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to log');
    } finally {
      setLogging(false);
    }
  };

  const handleLogExtra = async () => {
    setLogging(true);
    try {
      const res = await api.post(`/api/rescuer/${planId}/extra`, { note: extraNote });
      setPlan(res.data.plan);
      setShowExtraModal(false);
      setExtraNote('');
      toast.success(res.data.message || "It's okay. Plan adjusted. 💚");
    } catch (err) {
      toast.error('Failed to log extra');
    } finally {
      setLogging(false);
    }
  };

  const handleUrgeResisted = async (outcome) => {
    setShowTimer(false);
    if (outcome === 'win' || outcome === 'partial') {
      try {
        const res = await api.post(`/api/rescuer/${planId}/resist`);
        setPlan(res.data.plan);
        toast.success(outcome === 'win' ? '🏆 Urge defeated! You\'re incredible.' : '💪 Good effort! Every minute counts.');
      } catch {}
    } else {
      // Slipped — open extra modal
      setShowExtraModal(true);
    }
  };

  // ── Circular progress ────────────────────────────────────────────────────
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progressPct);

  if (loading) {
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your Rescuer plan…</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="page max-w-3xl">
      {/* Timer overlay */}
      <AnimatePresence>
        {showTimer && (
          <UrgeCooldownTimer
            viceName={viceName}
            onClose={() => setShowTimer(false)}
            onResisted={handleUrgeResisted}
          />
        )}
      </AnimatePresence>

      {/* Extra log modal */}
      <AnimatePresence>
        {showExtraModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass w-full max-w-sm rounded-3xl p-6 border border-white/10"
            >
              <h3 className="font-display font-bold text-xl text-white mb-1">Log an Extra</h3>
              <p className="text-slate-400 text-sm mb-4">
                It's okay. We'll adjust. Let's try to make your next gap 30 minutes longer.
              </p>
              <textarea
                value={extraNote}
                onChange={e => setExtraNote(e.target.value)}
                placeholder="Optional: what triggered it? (helps us learn)"
                rows={3}
                className="input resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowExtraModal(false)} className="btn-outline flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleLogExtra} disabled={logging} className="btn-primary flex-1 justify-center">
                  {logging ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Log It 💚'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/rescuer')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm">
              <ArrowLeft size={16} /> All Plans
            </button>
          </div>
          <Link to={`/rescuer/start/${plan.addictionId?._id}`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            <Pencil size={14} /> Edit
          </Link>
        </div>

        {/* Vice name + Phase badge */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-slate-400 text-sm mb-1 capitalize">{viceName.replace('_', ' ')}</p>
              <h1 className="font-display font-bold text-2xl text-white capitalize">{viceLabel}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {plan.baselineDaily} {plan.unit}/day → <span className="text-teal-400">0</span>
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${phase.bg} ${phase.color}`}>
              Phase {plan.currentPhase} — {phase.label}
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-3">{phase.desc}</p>
        </div>

        {/* Peak time alert (fires 15 min before urge times) */}
        <PeakTimeAlert urgeMap={plan.urgeMap || []} viceName={viceName} />

        {/* Phase 4 Freedom mode */}
        {plan.currentPhase === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 border border-green-500/30 bg-green-500/5 text-center"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">You've reached Freedom!</h2>
            <p className="text-slate-400 text-sm">
              You're now in Maintenance Mode. Focus on relapse prevention and keeping your clean streak alive.
            </p>
          </motion.div>
        )}

        {plan.currentPhase < 4 && (
          <>
            {/* Today's target + progress ring */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <h2 className="font-semibold text-white mb-4">Today's Goal</h2>

              {isIntermittentOff ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">⭕</div>
                  <p className="font-display font-bold text-2xl text-violet-400">Rest Day</p>
                  <p className="text-slate-400 text-sm mt-1">Today is a zero-unit day. You've got this.</p>
                </div>
              ) : (
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Ring */}
                  <div className="relative w-36 h-36 shrink-0 mx-auto sm:mx-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r={radius}
                        fill="none"
                        stroke={isOnTarget ? (plan.currentPhase === 1 ? '#0ea5e9' : '#14b8a6') : '#ef4444'}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-black text-2xl text-white">{todayConsumed}</span>
                      <span className="text-slate-400 text-xs">of {todayTarget}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Today's target</p>
                      <p className="font-display font-bold text-3xl text-white">{todayTarget} <span className="text-lg font-normal text-slate-400">{plan.unit}</span></p>
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-medium ${isOnTarget ? 'text-teal-400' : 'text-red-400'}`}>
                      {isOnTarget ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                      {isOnTarget
                        ? `${Math.max(0, todayTarget - todayConsumed)} ${plan.unit} remaining`
                        : `${todayConsumed - todayTarget} over target — plan adjusted`
                      }
                    </div>
                    {urgesResisted > 0 && (
                      <div className="flex items-center gap-2 text-sm text-violet-400">
                        <Shield size={14} />
                        {urgesResisted} urge{urgesResisted > 1 ? 's' : ''} resisted today 💪
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Big Urge Button */}
            <motion.button
              id="rescuer-urge-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowTimer(true)}
              className="w-full rounded-2xl p-5 border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-rose-500/10 flex items-center justify-between group transition-all hover:border-orange-500/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-base">I Feel an Urge Right Now</p>
                  <p className="text-slate-400 text-xs mt-0.5">Wait 15 minutes — most cravings fade completely.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
            </motion.button>

            {/* Log today's consumption */}
            <div className="glass rounded-2xl p-5 border border-white/8 space-y-4">
              <h2 className="font-semibold text-white">Log Today's Consumption</h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLogInput(v => String(Math.max(0, Number(v) - 1)))}
                  className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 flex items-center justify-center transition-all"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number" min="0"
                  value={logInput}
                  onChange={e => setLogInput(e.target.value)}
                  placeholder="0"
                  className="input text-center text-2xl font-bold w-24 py-2"
                />
                <button
                  type="button"
                  onClick={() => setLogInput(v => String(Number(v) + 1))}
                  className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 flex items-center justify-center transition-all"
                >
                  <Plus size={16} />
                </button>
                <span className="text-slate-400 text-sm flex-1">{plan.unit} consumed today</span>
              </div>

              <div className="flex gap-3">
                <button
                  id="rescuer-log-btn"
                  onClick={handleLogDay}
                  disabled={logging || logInput === ''}
                  className="btn-primary flex-1 justify-center"
                >
                  {logging ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={15} /> Save Log</>}
                </button>
                <button
                  id="rescuer-extra-btn"
                  onClick={() => setShowExtraModal(true)}
                  className="btn-outline justify-center px-4"
                  title="Log an extra (slip-up protocol)"
                >
                  <Plus size={15} /> Extra
                </button>
              </div>

              {todayLog && (
                <p className="text-slate-500 text-xs">
                  Last updated: {new Date(plan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {todayLog.extraLogged && <span className="ml-2 text-amber-400">• adjusted ✓</span>}
                </p>
              )}
            </div>
          </>
        )}

        {/* Weekly Calendar */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" /> This Week's Schedule
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {(plan.weeklySchedule || []).map((day, idx) => {
              const d = new Date(day.date);
              d.setUTCHours(0, 0, 0, 0);
              const isToday = d.getTime() === today.getTime();
              const isPast = d < today;
              const log = plan.logs?.find(l => {
                const ld = new Date(l.date);
                ld.setUTCHours(0, 0, 0, 0);
                return ld.getTime() === d.getTime();
              });
              const achieved = log && log.consumed <= day.target;
              const slipped = log && log.consumed > day.target;

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-2 text-center border transition-all ${
                    isToday
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : achieved
                      ? 'border-green-500/30 bg-green-500/5'
                      : slipped
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-white/5 bg-white/2'
                  }`}
                >
                  <p className={`text-xs mb-1 font-medium ${isToday ? 'text-teal-400' : 'text-slate-500'}`}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`font-bold text-sm ${isToday ? 'text-white' : 'text-slate-400'}`}>
                    {day.isIntermittent ? '⭕' : day.target}
                  </p>
                  {achieved && <p className="text-xs text-green-400 mt-0.5">✓</p>}
                  {slipped && <p className="text-xs text-red-400 mt-0.5">!</p>}
                  {isToday && !log && <p className="text-xs text-teal-400/60 mt-0.5">•</p>}
                </div>
              );
            })}
          </div>
          <p className="text-slate-500 text-xs mt-3">Numbers = daily target {plan.unit}. ✓ = met goal. ⭕ = rest day.</p>
        </div>

        {/* Staircase Chart */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" /> Your Tapering Journey
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            {plan.baselineDaily} {plan.unit} → 0. Green dots = on target. Red = over.
          </p>
          <StaircaseChart plan={plan} />
        </div>

        {/* Savings Card */}
        <RescuerSavingsCard plan={plan} />

        {/* Dynamic Journey Roadmap */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Map size={16} className="text-slate-400" /> Your Personal Roadmap
          </h2>
          <div className="space-y-4">
            {(() => {
              const b = plan.baselineDaily;
              const u = plan.unit;
              const currentPhase = plan.currentPhase;

              // Compute texts dynamically
              let p1 = `Cut to ${Math.ceil(b * 0.8)} ${u}/day. Focus on delaying your urges by 15 minutes.`;
              let p1Active = currentPhase === 1;
              let p1Skipped = b <= 4;
              if (b <= 4) p1 = `Skipped. Your baseline is low enough to bypass this phase.`;
              
              let p2 = `Gradual reduction dropping 1-2 ${u} per week down to 2 ${u}/day.`;
              let p2Active = currentPhase === 2;
              let p2Skipped = b <= 2;
              if (b <= 2) p2 = `Skipped. You are already at or below the 2 ${u}/day critical minimum.`;

              const p3Min = Math.min(2, b);
              let p3 = `Intermittent Days: 48-hour cycles. Alternate between ${p3Min} ${u} one day, and 0 ${u} the next.`;
              let p3Active = currentPhase === 3;

              let p4 = `Total Freedom. 0 ${u}/day permanently. Focus on relapse prevention.`;
              let p4Active = currentPhase === 4;

              const phases = [
                { num: 1, title: 'Stabilization', text: p1, active: p1Active, skipped: p1Skipped },
                { num: 2, title: 'Active Reduction', text: p2, active: p2Active, skipped: p2Skipped },
                { num: 3, title: 'Critical Minimum', text: p3, active: p3Active, skipped: false },
                { num: 4, title: 'Freedom', text: p4, active: p4Active, skipped: false }
              ];

              return phases.map(p => (
                <div key={p.num} className={`flex items-start gap-4 transition-all ${p.active ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}>
                  <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border 
                    ${p.active ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : p.skipped ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white/10 border-white/20 text-slate-400'}`}>
                    {p.num}
                  </div>
                  <div>
                    <h3 className={`font-semibold  ${p.active ? 'text-orange-400' : p.skipped ? 'text-slate-500 line-through decoration-slate-500/50' : 'text-slate-200'}`}>
                      Phase {p.num}: {p.title} {p.active && <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">Current</span>}
                    </h3>
                    <p className={`text-sm mt-1 leading-relaxed ${p.active ? 'text-slate-300' : 'text-slate-500'}`}>{p.text}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Peak Times */}
        {plan.urgeMap?.length > 0 && (
          <div className="glass rounded-2xl p-5 border border-white/8">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Bell size={15} className="text-slate-400" /> Your Peak Urge Times
            </h2>
            <div className="space-y-2">
              {plan.urgeMap.map((entry, idx) => {
                const { hours, minutes } = (() => {
                  const [h, m] = entry.time.split(':').map(Number);
                  return { hours: h, minutes: m };
                })();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h12 = hours % 12 || 12;
                return (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <Clock size={14} className="text-teal-400 shrink-0" />
                    <span className="text-white font-medium">
                      {h12}:{String(minutes).padStart(2, '0')} {ampm}
                    </span>
                    {entry.label && <span className="text-slate-500">— {entry.label}</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-slate-500 text-xs mt-3">Alerts fire 15 minutes before each peak time.</p>
          </div>
        )}

        {/* Substitution Tips */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Heart size={15} className="text-slate-400" /> Your Craving Toolkit
          </h2>
          {viceName === 'nicotine' && (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> Hold a pen or pencil — replace the hand-to-mouth habit</li>
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> Try 5 deep diaphragmatic breaths when an urge hits</li>
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> Keep sugar-free gum or dark chocolate nearby</li>
            </ul>
          )}
          {viceName === 'chewing_tobacco' && (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span> Pop a cardamom (Elaichi) — satisfies the oral fixation instantly</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span> Cinnamon sticks or cloves work equally well</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span> Sunflower seeds keep your mouth busy productively</li>
            </ul>
          )}
          {viceName === 'alcohol' && (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Drink sparkling water with lime — the ritual feels similar</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Cold-brew tea or kombucha as an evening substitute</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Call a friend — social triggers are better handled socially</li>
            </ul>
          )}
          {!['nicotine', 'chewing_tobacco', 'alcohol'].includes(viceName) && (
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> When urge hits, do 20 push-ups or jog in place for 60 seconds</li>
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> Have a glass of cold water — physiologically resets your state</li>
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5">•</span> Text a support person immediately when you feel the pull</li>
            </ul>
          )}
        </div>

      </motion.div>
    </div>
  );
}
