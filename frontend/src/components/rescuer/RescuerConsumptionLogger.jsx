import { Plus, Minus, CheckCircle } from 'lucide-react';

export default function RescuerConsumptionLogger({
  plan,
  logInput,
  setLogInput,
  onLogDay,
  onOpenExtra,
  logging,
  todayLog,
}) {
  const step =
    plan.frequency === 'weekly' || (plan.baselineQuantity && plan.baselineQuantity < 2)
      ? 0.25
      : (plan.baselineQuantity && plan.baselineQuantity < 5 ? 0.5 : 1);

  const handleStep = (direction) => {
    const current = Number(logInput) || 0;
    const nextVal = Math.max(0, parseFloat((current + direction * step).toFixed(2)));
    setLogInput(String(nextVal));
  };

  return (
    <div className="glass rounded-2xl p-5 border border-white/8 space-y-4">
      <h2 className="font-semibold text-white">Log Today's Consumption</h2>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 flex items-center justify-center transition-all"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          min="0"
          step="0.1"
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
          placeholder="0"
          className="input text-center text-2xl font-bold w-28 py-2"
        />
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 text-slate-300 hover:bg-white/12 flex items-center justify-center transition-all"
        >
          <Plus size={16} />
        </button>
        <span className="text-slate-400 text-sm flex-1">{plan.unit} consumed today</span>
      </div>

      <div className="flex gap-3">
        <button
          id="rescuer-log-btn"
          onClick={onLogDay}
          disabled={logging || logInput === ''}
          className="btn-primary flex-1 justify-center"
        >
          {logging ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={15} /> Save Log
            </>
          )}
        </button>
        <button
          id="rescuer-extra-btn"
          onClick={onOpenExtra}
          className="btn-outline justify-center px-4"
          title="Log an extra (gentle slip-up protocol)"
        >
          <Plus size={15} /> Extra
        </button>
      </div>

      {todayLog && (
        <p className="text-slate-500 text-xs">
          Last updated:{' '}
          {new Date(plan.updatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {todayLog.extraLogged && <span className="ml-2 text-teal-400">• gentle hold active ✓</span>}
        </p>
      )}
    </div>
  );
}
