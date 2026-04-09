import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Minus, Clock, Activity,
  AlertTriangle, ChevronDown, ChevronUp, Info,
} from 'lucide-react';

// Unit options per vice type
const UNIT_OPTIONS = {
  nicotine:       ['Cigarettes', 'Sticks', 'Puffs'],
  chewing_tobacco:['Packets', 'Pouches', 'Sachets', 'Grams'],
  alcohol:        ['Pegs', 'Shots', 'Glasses', 'Bottles', 'Cans'],
  cannabis:       ['Joints', 'Grams', 'Hits', 'Bowls'],
  opioids:        ['Doses', 'Tablets', 'mg'],
  stimulants:     ['Doses', 'Lines', 'Grams'],
  gambling:       ['Sessions', 'Bets', 'Hours'],
  other:          ['Units', 'Times', 'Sessions', 'Doses'],
};

const FIRST_DOSE_OPTIONS = [
  { label: 'Within 5 minutes', value: 5 },
  { label: '5 – 30 minutes', value: 17 },
  { label: '30 – 60 minutes', value: 45 },
  { label: 'After 1 hour', value: 90 },
];

// Medical disclaimer thresholds
const MEDICAL_THRESHOLDS = {
  alcohol: 8,
  opioids: 0,
  stimulants: 0,
};

function needsMedicalDisclaimer(viceName, baseline) {
  if (viceName === 'opioids' || viceName === 'stimulants') return true;
  if (viceName === 'alcohol' && baseline >= MEDICAL_THRESHOLDS.alcohol) return true;
  return false;
}

export default function RescuerIntakePage() {
  const { addictionId: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [addictions, setAddictions] = useState([]);
  const [selectedId, setSelectedId] = useState(paramId || '');
  const [selectedAddiction, setSelectedAddiction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAddictions, setFetchingAddictions] = useState(true);
  const [existingPlanId, setExistingPlanId] = useState(null);

  const [form, setForm] = useState({
    unit: 'Cigarettes',
    baselineDaily: 10,
    pricePerUnit: 15,
    currency: user?.currency || 'INR',
    firstDoseMinutes: 45,
  });
  const [urgeMap, setUrgeMap] = useState([{ time: '08:00', label: 'Morning' }]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [addRes, planRes] = await Promise.all([
          api.get('/api/addictions'),
          paramId ? api.get(`/api/rescuer/${paramId}`).catch(() => null) : Promise.resolve(null)
        ]);

        const adds = addRes.data.addictions || [];
        setAddictions(adds);

        let existingPlan = null;
        if (paramId) {
          const a = adds.find(x => x._id === paramId);
          if (a) setSelectedAddiction(a);
          existingPlan = planRes?.data?.plan;
        }

        if (existingPlan) {
          setExistingPlanId(existingPlan._id);
          setForm({
            unit: existingPlan.unit || 'Cigarettes',
            baselineDaily: existingPlan.baselineDaily || 10,
            pricePerUnit: existingPlan.pricePerUnit || 0,
            currency: existingPlan.currency || user?.currency || 'INR',
            firstDoseMinutes: existingPlan.firstDoseMinutes || 45,
          });
          if (existingPlan.urgeMap?.length > 0) {
            // Re-format time to ensure it works with input type='time'
            setUrgeMap(existingPlan.urgeMap.map(u => ({ time: u.time, label: u.label })));
          }
        } else if (paramId) {
             const a = adds.find(x => x._id === paramId);
             if (a) {
               const units = UNIT_OPTIONS[a.viceName] || UNIT_OPTIONS.other;
               setForm(f => ({ ...f, unit: units[0], currency: a.currency || 'INR', pricePerUnit: a.dailySpending || 0 }));
             }
        }
      } finally {
        setFetchingAddictions(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, [paramId]);

  useEffect(() => {
    if (!selectedId || fetchingAddictions) return;
    if (selectedId !== paramId) {
      const a = addictions.find(x => x._id === selectedId);
      setSelectedAddiction(a || null);
      if (a) {
        const units = UNIT_OPTIONS[a.viceName] || UNIT_OPTIONS.other;
        setForm(f => ({ ...f, unit: units[0], currency: a.currency || 'INR', pricePerUnit: a.dailySpending || 0 }));
        setUrgeMap([{ time: '08:00', label: 'Morning' }]);
      }
    }
  }, [selectedId, addictions, fetchingAddictions, paramId]);

  // Show disclaimer when vice or baseline changes
  useEffect(() => {
    if (!selectedAddiction) return;
    setShowDisclaimer(needsMedicalDisclaimer(selectedAddiction.viceName, form.baselineDaily));
  }, [selectedAddiction, form.baselineDaily]);

  const addUrgeTime = () => {
    if (urgeMap.length >= 6) { toast.error('Maximum 6 peak times'); return; }
    setUrgeMap(u => [...u, { time: '12:00', label: '' }]);
  };

  const removeUrgeTime = (idx) => setUrgeMap(u => u.filter((_, i) => i !== idx));

  const updateUrgeTime = (idx, field, value) => {
    setUrgeMap(u => u.map((entry, i) => i === idx ? { ...entry, [field]: value } : entry));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) { toast.error('Please select a vice'); return; }
    if (form.baselineDaily < 1) { toast.error('Daily quantity must be at least 1'); return; }
    setLoading(true);
    try {
      const payload = {
        addictionId: selectedId,
        unit: form.unit,
        baselineDaily: Number(form.baselineDaily),
        pricePerUnit: Number(form.pricePerUnit) || 0,
        currency: form.currency,
        firstDoseMinutes: Number(form.firstDoseMinutes),
        urgeMap,
      };
      let res;
      if (existingPlanId) {
        res = await api.put(`/api/rescuer/${existingPlanId}`, payload);
        toast.success('Your Rescuer plan has been updated! 🌿');
      } else {
        res = await api.post('/api/rescuer', payload);
        toast.success('Your Rescuer plan is ready! 🌿');
      }
      navigate(`/rescuer/${res.data.plan._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = selectedAddiction
    ? (UNIT_OPTIONS[selectedAddiction.viceName] || UNIT_OPTIONS.other)
    : ['Units'];

  const viceName = selectedAddiction?.customName || selectedAddiction?.viceName || '';

  return (
    <div className="page max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
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
              <p className="text-slate-400 text-sm">Smart Tapering Engine</p>
            </div>
          </div>
          <p className="text-slate-400 mt-3 leading-relaxed">
            Share your baseline and we'll build a personalized reduction plan — gradual, compassionate, and science-backed.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">

          {/* Step 1: Select Vice */}
          <div className="glass p-6 rounded-2xl border border-white/8">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">1</span>
              Which vice are you tapering?
            </h2>
            <p className="text-slate-500 text-xs mb-4">Select the addiction you want The Rescuer to help with.</p>
            {fetchingAddictions ? (
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : addictions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">No vices tracked yet.</p>
                <button type="button" onClick={() => navigate('/add-vice')} className="btn-primary mt-3 text-sm">
                  <Plus size={14} /> Add a Vice First
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {addictions.map(a => (
                  <button
                    key={a._id} type="button"
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
                      For <span className="font-medium text-amber-300 capitalize">{selectedAddiction.viceName.replace('_', ' ')}</span> at high quantities,
                      sudden withdrawal can be <strong>dangerous</strong> and may cause severe symptoms.
                      Please consult a doctor or healthcare professional alongside using this app.
                      This plan is a supplement, not a replacement for medical advice.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Unit & Baseline */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-5">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">2</span>
                  Your Baseline
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Unit Type</label>
                    <select
                      value={form.unit}
                      onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      className="input"
                    >
                      {unitOptions.map(u => <option key={u} value={u} className="bg-slate-800">{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      className="input"
                    >
                      {['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => (
                        <option key={c} value={c} className="bg-slate-800">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Daily Quantity — how many {form.unit} per day right now?
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, baselineDaily: Math.max(1, f.baselineDaily - 1) }))}
                      className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 transition-all flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number" min="1" max="200"
                      value={form.baselineDaily}
                      onChange={e => setForm(f => ({ ...f, baselineDaily: Math.max(1, Number(e.target.value)) }))}
                      className="input text-center text-2xl font-bold w-24 py-2"
                    />
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, baselineDaily: f.baselineDaily + 1 }))}
                      className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 transition-all flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-slate-400 text-sm">{form.unit}/day</span>
                  </div>
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
                      type="number" min="0" step="0.5"
                      value={form.pricePerUnit}
                      onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))}
                      className="input pl-10"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Used to calculate your daily savings
                  </p>
                </div>
              </div>

              {/* Step 3: Urge Map */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-4">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">3</span>
                    Your Urge Map
                  </h2>
                  <p className="text-slate-500 text-xs">
                    When do you feel the urge most strongly? We'll send alerts 15 min before each peak time.
                  </p>
                </div>

                <div className="space-y-3">
                  {urgeMap.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Clock size={15} className="text-slate-500 shrink-0" />
                      <input
                        type="time"
                        value={entry.time}
                        onChange={e => updateUrgeTime(idx, 'time', e.target.value)}
                        className="input w-32 text-sm py-2"
                      />
                      <input
                        type="text"
                        value={entry.label}
                        onChange={e => updateUrgeTime(idx, 'label', e.target.value)}
                        placeholder="e.g. After lunch"
                        className="input flex-1 text-sm py-2"
                      />
                      {urgeMap.length > 1 && (
                        <button type="button" onClick={() => removeUrgeTime(idx)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Minus size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {urgeMap.length < 6 && (
                  <button type="button" onClick={addUrgeTime}
                    className="flex items-center gap-2 text-teal-400 text-sm hover:text-teal-300 transition-colors">
                    <Plus size={14} /> Add another peak time
                  </button>
                )}
              </div>

              {/* Step 4: Dependency Level */}
              <div className="glass p-6 rounded-2xl border border-white/8 space-y-4">
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">4</span>
                    Dependency Level
                  </h2>
                  <p className="text-slate-500 text-xs">
                    How soon after waking do you have your first {form.unit.toLowerCase().replace(/s$/, '')}?
                    This helps us calibrate your plan.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FIRST_DOSE_OPTIONS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setForm(f => ({ ...f, firstDoseMinutes: opt.value }))}
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

                {form.firstDoseMinutes <= 17 && (
                  <div className="flex items-start gap-2 bg-rose-500/8 rounded-xl p-3 border border-rose-500/20">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-rose-300 text-xs">
                      High physical dependency detected. Your plan will include extra support and a gentler reduction curve.
                    </p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="glass p-5 rounded-2xl border border-teal-500/20 bg-teal-500/5">
                <p className="text-teal-400 font-semibold text-sm mb-3">📋 Your Plan Preview</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Week 1 daily target</span>
                    <span className="text-white font-semibold">
                      {Math.ceil(form.baselineDaily * 0.8)} {form.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily saving potential</span>
                    <span className="text-green-400 font-semibold">
                      {form.pricePerUnit > 0
                        ? `${form.currency === 'INR' ? '₹' : '$'}${((form.baselineDaily - Math.ceil(form.baselineDaily * 0.8)) * form.pricePerUnit).toFixed(0)}/day`
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak times tracked</span>
                    <span className="text-white font-semibold">{urgeMap.length}</span>
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
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Activity size={18} /> {existingPlanId ? 'Update My Rescuer Plan' : 'Start My Rescuer Plan'}</>
                }
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
