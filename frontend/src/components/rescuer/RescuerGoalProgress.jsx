import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export default function RescuerGoalProgress({
  plan,
  isIntermittentOff,
  todayTarget,
  todayConsumed,
  urgesResisted,
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressPct = todayTarget > 0 ? Math.min(1, todayConsumed / todayTarget) : 0;
  const offset = circumference * (1 - progressPct);
  const isOnTarget = todayConsumed <= todayTarget;

  const fmtTarget = todayTarget % 1 === 0 ? todayTarget : todayTarget.toFixed(1);
  const fmtConsumed = todayConsumed % 1 === 0 ? todayConsumed : todayConsumed.toFixed(1);
  const remaining = Math.max(0, parseFloat((todayTarget - todayConsumed).toFixed(1)));
  const overage = Math.max(0, parseFloat((todayConsumed - todayTarget).toFixed(1)));

  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <h2 className="font-semibold text-white mb-4">Today's Goal</h2>

      {isIntermittentOff ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">⭕</div>
          <p className="font-display font-bold text-2xl text-violet-400">Zero-Dose Rest Day</p>
          <p className="text-slate-400 text-sm mt-1">
            Today is an intentional clean day. Your neuroreceptors are resetting. You've got this.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-6 flex-wrap">
          {/* Ring */}
          <div className="relative w-36 h-36 shrink-0 mx-auto sm:mx-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={isOnTarget ? (plan.currentPhase === 1 ? '#0ea5e9' : '#14b8a6') : '#f59e0b'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-2xl text-white">{fmtConsumed}</span>
              <span className="text-slate-400 text-xs">of {fmtTarget}</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <p className="text-slate-400 text-sm">Today's target</p>
              <p className="font-display font-bold text-3xl text-white">
                {fmtTarget} <span className="text-lg font-normal text-slate-400">{plan.unit}</span>
              </p>
            </div>
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                isOnTarget ? 'text-teal-400' : 'text-amber-400'
              }`}
            >
              {isOnTarget ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
              {isOnTarget
                ? `${remaining} ${plan.unit} remaining`
                : `${overage} ${plan.unit} over target — held steady for comfort`}
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
  );
}
