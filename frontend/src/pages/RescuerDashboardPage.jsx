import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ChevronRight, Zap, TrendingUp } from 'lucide-react';

import {
  fetchPlanById,
  logDailyConsumption,
  logExtraConsumption,
  logUrgeResisted,
} from '../store/slices/rescuerSlice';

import UrgeCooldownTimer from '../components/UrgeCooldownTimer';
import StaircaseChart from '../components/StaircaseChart';
import PeakTimeAlert from '../components/PeakTimeAlert';
import RescuerSavingsCard from '../components/RescuerSavingsCard';

import RescuerHeader from '../components/rescuer/RescuerHeader';
import RescuerGoalProgress from '../components/rescuer/RescuerGoalProgress';
import RescuerConsumptionLogger from '../components/rescuer/RescuerConsumptionLogger';
import RescuerWeeklySchedule from '../components/rescuer/RescuerWeeklySchedule';
import RescuerRoadmap from '../components/rescuer/RescuerRoadmap';
import RescuerToolkit from '../components/rescuer/RescuerToolkit';
import RescuerExtraModal from '../components/rescuer/RescuerExtraModal';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export default function RescuerDashboardPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activePlan: plan, activeLoading: loading } = useSelector((state) => state.rescuer);

  const [showTimer, setShowTimer] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logInput, setLogInput] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [showExtraModal, setShowExtraModal] = useState(false);

  const loadPlan = useCallback(async () => {
    try {
      const p = await dispatch(fetchPlanById(planId)).unwrap();
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const tLog = p.logs?.find((l) => {
        const d = new Date(l.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      if (tLog && tLog.consumed > 0) {
        setLogInput(String(tLog.consumed));
      }
    } catch {
      toast.error('Could not load plan');
      navigate('/rescuer');
    }
  }, [planId, navigate, dispatch]);

  useEffect(() => {
    loadPlan();
    requestNotificationPermission();
  }, [loadPlan]);

  // Derived state
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const todayIdx =
    plan?.weeklySchedule?.findIndex((s) => {
      const d = new Date(s.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }) ?? -1;

  const todaySchedule = todayIdx >= 0 ? plan?.weeklySchedule[todayIdx] : null;
  const todayTarget = todaySchedule?.target ?? plan?.currentDailyTarget ?? 0;
  const isIntermittentOff = todaySchedule?.isIntermittent === true;

  const todayLog = plan?.logs?.find((l) => {
    const d = new Date(l.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const todayConsumed = todayLog?.consumed ?? 0;
  const urgesResisted = todayLog?.urgeResisted ?? 0;
  const viceName = plan?.addictionId?.viceName || 'other';

  const handleLogDay = async () => {
    const qty = Number(logInput);
    if (!qty && qty !== 0) {
      return toast.error('Enter a valid quantity');
    }
    setLogging(true);
    try {
      await dispatch(logDailyConsumption({ planId, consumed: qty })).unwrap();
      toast.success(qty <= todayTarget ? '✅ Logged! Well done!' : '📝 Logged and plan adjusted.');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to log');
    } finally {
      setLogging(false);
    }
  };

  const handleLogExtra = async () => {
    setLogging(true);
    try {
      await dispatch(logExtraConsumption({ planId, note: extraNote })).unwrap();
      setShowExtraModal(false);
      setExtraNote('');
      toast.success("It's okay. Plan adjusted. 💚");
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to log extra');
    } finally {
      setLogging(false);
    }
  };

  const handleUrgeResisted = async (outcome) => {
    setShowTimer(false);
    if (outcome === 'win' || outcome === 'partial') {
      try {
        await dispatch(logUrgeResisted(planId)).unwrap();
        toast.success(
          outcome === 'win'
            ? "🏆 Urge defeated! You're incredible."
            : '💪 Good effort! Every minute counts.'
        );
      } catch {
        // ignore
      }
    } else {
      setShowExtraModal(true);
    }
  };

  if (loading && !plan) {
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
        <RescuerExtraModal
          show={showExtraModal}
          onClose={() => setShowExtraModal(false)}
          extraNote={extraNote}
          setExtraNote={setExtraNote}
          onLogExtra={handleLogExtra}
          logging={logging}
        />
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Header */}
        <RescuerHeader plan={plan} />

        {/* Peak time alert */}
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
            {/* Goal Progress Ring */}
            <RescuerGoalProgress
              plan={plan}
              isIntermittentOff={isIntermittentOff}
              todayTarget={todayTarget}
              todayConsumed={todayConsumed}
              urgesResisted={urgesResisted}
            />

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

            {/* Consumption Logger */}
            <RescuerConsumptionLogger
              plan={plan}
              logInput={logInput}
              setLogInput={setLogInput}
              onLogDay={handleLogDay}
              onOpenExtra={() => setShowExtraModal(true)}
              logging={logging}
              todayLog={todayLog}
            />
          </>
        )}

        {/* Weekly Calendar */}
        <RescuerWeeklySchedule plan={plan} today={today} />

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
        <RescuerRoadmap plan={plan} />

        {/* Substitution Tips & Peak Urge Times */}
        <RescuerToolkit plan={plan} viceName={viceName} />
      </motion.div>
    </div>
  );
}
