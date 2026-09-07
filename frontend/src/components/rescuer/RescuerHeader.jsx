import { ArrowLeft, Pencil, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const RESCUER_PHASES = {
  1: {
    label: 'Stabilization',
    desc: 'Stage 1 — Cue Decoupling & Time Shifting. Breaking automatic habits.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
  },
  2: {
    label: 'Active Reduction',
    desc: 'Stage 2 — Hyperbolic Step-Down. Gradual, biologically gentle reduction.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/15 border-teal-500/30',
  },
  3: {
    label: 'Critical Minimum',
    desc: 'Stage 3 — Interval Consolidation & Micro-Dosing. Alternating clean periods.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15 border-violet-500/30',
  },
  4: {
    label: 'Freedom',
    desc: 'Stage 4 — Total Independence & Relapse Shield.',
    color: 'text-green-400',
    bg: 'bg-green-500/15 border-green-500/30',
  },
};

export default function RescuerHeader({ plan }) {
  const navigate = useNavigate();
  const phase = RESCUER_PHASES[plan.currentPhase] || RESCUER_PHASES[1];
  const viceName = plan?.addictionId?.viceName || 'other';
  const viceLabel = plan?.addictionId?.customName || plan?.addictionId?.viceName || 'Vice';

  const freqLabel = plan.frequency === 'weekly' ? 'week' : 'day';
  const displayQty = plan.baselineQuantity || plan.baselineDaily;

  return (
    <div className="space-y-4">
      {/* Back button & Edit link */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/rescuer')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> All Plans
        </button>
        <Link
          to={`/rescuer/start/${plan.addictionId?._id}`}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
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
              Baseline: <span className="text-white font-medium">{displayQty} {plan.unit}/{freqLabel}</span> → <span className="text-teal-400 font-semibold">0 Freedom</span>
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${phase.bg} ${phase.color}`}>
            Phase {plan.currentPhase} — {phase.label}
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-3">{phase.desc}</p>
      </div>

      {/* Stabilization hold alert if user had a slip-up */}
      {plan.holdDays > 0 && (
        <div className="glass rounded-2xl p-3.5 border border-teal-500/30 bg-teal-500/10 flex items-center gap-3">
          <ShieldCheck size={18} className="text-teal-400 shrink-0" />
          <p className="text-xs text-teal-200 leading-relaxed">
            <strong>Gentle Hold Active:</strong> Target is being held steady for {plan.holdDays} extra days so your body adapts safely without withdrawal cravings.
          </p>
        </div>
      )}
    </div>
  );
}
