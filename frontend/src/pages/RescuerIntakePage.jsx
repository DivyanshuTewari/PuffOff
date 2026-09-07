import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Minus, Clock, Activity,
  AlertTriangle, Info, Calendar, Sparkles
} from 'lucide-react';

import { fetchAddictions } from '../store/slices/addictionsSlice';
import { createRescuerPlan, updateRescuerPlan } from '../store/slices/rescuerSlice';
import api from '../api/api';

const UNIT_OPTIONS = {
  nicotine: ['Cigarettes', 'Sticks', 'Packets', 'Puffs'],
  chewing_tobacco: ['Packets', 'Pouches', 'Sachets', 'Grams'],
  alcohol: ['Pegs', 'Shots', 'Glasses', 'Bottles', 'Cans'],
  cannabis: ['Joints', 'Grams', 'Hits', 'Bowls'],
  opioids: ['Doses', 'Tablets', 'mg'],
  stimulants: ['Doses', 'Lines', 'Grams'],
  gambling: ['Sessions', 'Bets', 'Hours'],
  other: ['Units', 'Times', 'Sessions', 'Doses'],
};

const FIRST_DOSE_OPTIONS = [
  { label: 'Within 5 minutes', value: 5 },
  { label: '5 – 30 minutes', value: 17 },
  { label: '30 – 60 minutes', value: 45 },
  { label: 'After 1 hour', value: 90 },
];

const MEDICAL_THRESHOLDS = {
  alcohol: 8,
  opioids: 0,
  stimulants: 0,
};

function needsMedicalDisclaimer(viceName, baseline, frequency) {
  if (viceName === 'opioids' || viceName === 'stimulants') return true;
  const dailyRate = frequency === 'weekly' ? baseline / 7 : baseline;
  if (viceName === 'alcohol' && dailyRate >= MEDICAL_THRESHOLDS.alcohol) return true;
  return false;
}

export default function RescuerIntakePage() {
  const { addictionId: paramId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { items: addictions, loading: fetchingAddictions } = useSelector((state) => state.addictions);

  const [selectedId, setSelectedId] = useState(paramId || '');
  const [selectedAddiction, setSelectedAddiction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingPlanId, setExistingPlanId] = useState(null);

  const [form, setForm] = useState({
    frequency: 'daily', // 'daily' | 'weekly'
    unit: 'Cigarettes',
    baselineQuantity: 10,
    pricePerUnit: 15,
    currency: user?.currency || 'INR',
    firstDoseMinutes: 45,
  });
  const [urgeMap, setUrgeMap] = useState([{ time: '08:00', label: 'Morning' }]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    dispatch(fetchAddictions());
  }, [dispatch]);

  useEffect(() => {
    const fetchExistingPlan = async () => {
      if (!paramId) return;
      try {
        const planRes = await api.get(`/api/rescuer/${paramId}`).catch(() => null);
        const existingPlan = planRes?.data?.plan;
        if (existingPlan) {
          setExistingPlanId(existingPlan._id);
          setForm({
            frequency: existingPlan.frequency || 'daily',
            unit: existingPlan.unit || 'Cigarettes',
            baselineQuantity: existingPlan.baselineQuantity || existingPlan.baselineDaily || 10,
            pricePerUnit: existingPlan.pricePerUnit || 0,
            currency: existingPlan.currency || user?.currency || 'INR',
            firstDoseMinutes: existingPlan.firstDoseMinutes || 45,
          });
          if (existingPlan.urgeMap?.length > 0) {
            setUrgeMap(existingPlan.urgeMap.map((u) => ({ time: u.time, label: u.label })));
          }
        }
      } catch {
        // ignore
      }
    };
    fetchExistingPlan();
  }, [paramId, user?.currency]);

  useEffect(() => {
    if (paramId && addictions.length > 0) {
      const a = addictions.find((x) => x._id === paramId);
      if (a) {
        setSelectedAddiction(a);
        if (!existingPlanId) {
          const units = UNIT_OPTIONS[a.viceName] || UNIT_OPTIONS.other;
          setForm((f) => ({
            ...f,
            unit: units[0],
            currency: a.currency || user?.currency || 'INR',
            pricePerUnit: a.dailySpending || 0,
          }));
        }
      }
    }
  }, [paramId, addictions, existingPlanId, user?.currency]);

  useEffect(() => {
    if (!selectedId || fetchingAddictions) return;
    if (selectedId !== paramId) {
      const a = addictions.find((x) => x._id === selectedId);
      setSelectedAddiction(a || null);
      if (a) {
        const units = UNIT_OPTIONS[a.viceName] || UNIT_OPTIONS.other;
        setForm((f) => ({
          ...f,
          unit: units[0],
          currency: a.currency || user?.currency || 'INR',
          pricePerUnit: a.dailySpending || 0,
        }));
        setUrgeMap([{ time: '08:00', label: 'Morning' }]);
      }
    }
  }, [selectedId, addictions, fetchingAddictions, paramId, user?.currency]);

  useEffect(() => {
    if (!selectedAddiction) return;
    setShowDisclaimer(needsMedicalDisclaimer(selectedAddiction.viceName, form.baselineQuantity, form.frequency));
  }, [selectedAddiction, form.baselineQuantity, form.frequency]);

  const addUrgeTime = () => {
    if (urgeMap.length >= 6) {
      return toast.error('Maximum 6 peak times');
    }
    setUrgeMap((u) => [...u, { time: '12:00', label: '' }]);
  };

  const removeUrgeTime = (idx) => setUrgeMap((u) => u.filter((_, i) => i !== idx));

  const updateUrgeTime = (idx, field, value) => {
    setUrgeMap((u) => u.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
  };

  const handleStepQuantity = (delta) => {
    setForm((f) => {
      const step = f.baselineQuantity < 2 ? 0.25 : (f.baselineQuantity < 5 ? 0.5 : 1);
      const newQty = Math.max(0.1, parseFloat((Number(f.baselineQuantity) + delta * step).toFixed(2)));
      return { ...f, baselineQuantity: newQty };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return toast.error('Please select a vice');
    const qty = Number(form.baselineQuantity);
    if (!qty || qty <= 0) return toast.error('Please enter a valid baseline quantity');

    setLoading(true);
    try {
      const payload = {
        addictionId: selectedId,
        unit: form.unit,
        frequency: form.frequency,
        baselineQuantity: qty,
        baselineDaily: form.frequency === 'weekly' ? parseFloat((qty / 7).toFixed(3)) : qty,
        pricePerUnit: Number(form.pricePerUnit) || 0,
        currency: form.currency,
        firstDoseMinutes: Number(form.firstDoseMinutes),
        urgeMap,
      };

      let resultPlan;
      if (existingPlanId) {
        resultPlan = await dispatch(updateRescuerPlan({ id: existingPlanId, data: payload })).unwrap();
        toast.success('Your Rescuer plan has been updated! 🌿');
      } else {
        resultPlan = await dispatch(createRescuerPlan(payload)).unwrap();
        toast.success('Your Rescuer plan is ready! 🌿');
      }
      navigate(`/rescuer/${resultPlan._id}`);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = selectedAddiction
    ? UNIT_OPTIONS[selectedAddiction.viceName] || UNIT_OPTIONS.other
    : ['Units'];

  const isWeekly = form.frequency === 'weekly';
  const targetWeek1 = isWeekly
    ? `${(form.baselineQuantity * 0.8).toFixed(1)} ${form.unit}/session (capped session window)`
    : `${(form.baselineQuantity * 0.8).toFixed(form.baselineQuantity < 3 ? 1 : 0)} ${form.unit}/day`;

  return (
    <div className="page max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-white">The Rescuer</h1>
              <p className="text-slate-400 text-sm">Universal Harm-Reduction Tapering Engine</p>
            </div>
          </div>
          <p className="text-slate-400 mt-3 leading-relaxed">
            Whether you consume 20 packets a day, 1 packet a day, or 1 packet a week, The Rescuer adapts a clinical hyperbolic curve designed to eliminate your cravings comfortably without withdrawal shock.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Step 1: Select Vice */}
          <div className="glass p-6 rounded-2xl border border-white/8">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Which vice are you tapering?
            </h2>
            <p className="text-slate-500 text-xs mb-4">Select the addiction you want The Rescuer to help with.</p>
            {fetchingAddictions ? (
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : addictions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">No vices tracked yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/add-vice')}
                  className="btn-primary mt-3 text-sm"
                >
                  <Plus size={14} /> Add a Vice First
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {addictions.map((a) => (
                  <button
                    key={a._id}
                    type="button"
                    onClick={() => setSelectedId(a._id)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      selectedId === a._id
                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                        : 'border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-medium capitalize">{a.customName || a.viceName}</div>
                    <div className="text-xs opacity-60 mt-0.5 capitalize">{a.viceName.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedAddiction && (
            <>
              {/* Medical Disclaimer */}
              {showDisclaimer && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex gap-3"
                >
                  <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm mb-1">Medical Disclaimer</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      For{' '}
                      <span className="font-medium text-amber-300 capitalize">
                        {selectedAddiction.viceName.replace('_', ' ')}
                      </span>{' '}
                      at high quantities, sudden withdrawal can be dangerous. Please consult a healthcare professional alongside this tapering plan.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Consumption Frequency & Baseline */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Your Consumption Pattern
                </h2>

                {/* Frequency selector: Daily vs Weekly */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">How often do you consume?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, frequency: 'daily' }))}
                      className={`p-3 rounded-xl border text-sm text-center font-medium transition-all ${
                        form.frequency === 'daily'
                          ? 'border-teal-500/50 bg-teal-500/15 text-teal-300 shadow-sm'
                          : 'border-white/8 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      📅 Daily (every day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, frequency: 'weekly' }))}
                      className={`p-3 rounded-xl border text-sm text-center font-medium transition-all ${
                        form.frequency === 'weekly'
                          ? 'border-orange-500/50 bg-orange-500/15 text-orange-300 shadow-sm'
                          : 'border-white/8 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      🗓️ Weekly / Occasional
                    </button>
                  </div>
                  {isWeekly && (
                    <p className="text-xs text-orange-300/80 mt-2 flex items-center gap-1.5">
                      <Sparkles size={13} /> For weekly users, The Rescuer uses an <strong>Interval-Extension Protocol</strong> to stretch clean days between uses.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Unit Type</label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                      className="input"
                    >
                      {unitOptions.map((u) => (
                        <option key={u} value={u} className="bg-slate-800">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="input"
                    >
                      {['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => (
                        <option key={c} value={c} className="bg-slate-800">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Baseline Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      {isWeekly
                        ? `Weekly Quantity — how many ${form.unit} per week?`
                        : `Daily Quantity — how many ${form.unit} per day?`}
                    </label>
                    {form.unit === 'Packets' && (
                      <span className="text-[11px] text-teal-400">1 packet ≈ 20 sticks</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(-1)}
                      className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 transition-all flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      max="200"
                      value={form.baselineQuantity}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          baselineQuantity: Math.max(0.1, Number(e.target.value) || 0),
                        }))
                      }
                      className="input text-center text-2xl font-bold w-28 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepQuantity(1)}
                      className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 transition-all flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-slate-400 text-sm">
                      {form.unit}/{isWeekly ? 'week' : 'day'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    You can enter fractions like <strong>0.5</strong> or <strong>1.5</strong> if you consume partial packs or bottles.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price per {form.unit}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      {form.currency === 'INR' ? '₹' : form.currency === 'USD' ? '$' : form.currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.pricePerUnit}
                      onChange={(e) => setForm((f) => ({ ...f, pricePerUnit: e.target.value }))}
                      className="input pl-10"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Used to calculate your financial recovery
                  </p>
                </div>
              </div>

              {/* Step 3: Urge Map */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-4">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Your Urge Map
                  </h2>
                  <p className="text-slate-500 text-xs">
                    When do you feel the urge most strongly? We will prepare substitute behaviors before peak times.
                  </p>
                </div>

                <div className="space-y-3">
                  {urgeMap.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Clock size={15} className="text-slate-500 shrink-0" />
                      <input
                        type="time"
                        value={entry.time}
                        onChange={(e) => updateUrgeTime(idx, 'time', e.target.value)}
                        className="input w-32 text-sm py-2"
                      />
                      <input
                        type="text"
                        value={entry.label}
                        onChange={(e) => updateUrgeTime(idx, 'label', e.target.value)}
                        placeholder="e.g. After lunch, Weekend night"
                        className="input flex-1 text-sm py-2"
                      />
                      {urgeMap.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrgeTime(idx)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {urgeMap.length < 6 && (
                  <button
                    type="button"
                    onClick={addUrgeTime}
                    className="flex items-center gap-2 text-teal-400 text-sm hover:text-teal-300 transition-colors"
                  >
                    <Plus size={14} /> Add another peak time
                  </button>
                )}
              </div>

              {/* Step 4: Dependency Level */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-4">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    Dependency Level
                  </h2>
                  <p className="text-slate-500 text-xs">
                    How soon after waking do you have your first {form.unit.toLowerCase().replace(/s$/, '')}?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FIRST_DOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, firstDoseMinutes: opt.value }))}
                      className={`p-3 rounded-xl border text-sm transition-all text-left ${
                        form.firstDoseMinutes === opt.value
                          ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                          : 'border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200'
                      }`}
                    >
                      {form.firstDoseMinutes === opt.value ? '◉' : '○'} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Preview */}
              <div className="glass p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5">
                <p className="text-teal-400 font-semibold text-sm mb-3">📋 Personalized Tapering Curve</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol type</span>
                    <span className="text-white font-semibold capitalize">
                      {isWeekly ? 'Interval Extension & Volume Cap' : 'Hyperbolic 15% Reduction'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phase 1 Target</span>
                    <span className="text-white font-semibold">{targetWeek1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slip-up safeguard</span>
                    <span className="text-teal-300 font-semibold">Hold & Stabilize (Zero punitive penalty)</span>
                  </div>
                </div>
              </div>

              <button
                id="rescuer-start-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 text-base"
                style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Activity size={18} />{' '}
                    {existingPlanId ? 'Update My Rescuer Plan' : 'Start My Rescuer Plan'}
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
