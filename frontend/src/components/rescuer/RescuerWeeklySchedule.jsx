import { Clock } from 'lucide-react';

export default function RescuerWeeklySchedule({ plan, today }) {
  const isWeekly = plan.frequency === 'weekly';

  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Clock size={16} className="text-slate-400" /> This Week's Schedule
        </h2>
        {isWeekly && (
          <span className="badge text-[11px] bg-orange-500/15 text-orange-300 border border-orange-500/30">
            Interval-Extension Protocol
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {(plan.weeklySchedule || []).map((day, idx) => {
          const d = new Date(day.date);
          d.setUTCHours(0, 0, 0, 0);
          const isToday = d.getTime() === today.getTime();
          const log = plan.logs?.find((l) => {
            const ld = new Date(l.date);
            ld.setUTCHours(0, 0, 0, 0);
            return ld.getTime() === d.getTime();
          });
          const achieved = log && log.consumed <= day.target;
          const slipped = log && log.consumed > day.target;

          const displayTarget =
            day.target > 0
              ? day.target % 1 === 0
                ? day.target
                : day.target.toFixed(1)
              : '⭕';

          return (
            <div
              key={idx}
              title={day.targetNote || ''}
              className={`rounded-xl p-2 text-center border transition-all ${
                isToday
                  ? 'border-teal-500/50 bg-teal-500/10 shadow-sm'
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
              <p className={`font-bold text-sm ${isToday ? 'text-white' : 'text-slate-300'}`}>
                {displayTarget}
              </p>
              {achieved && <p className="text-xs text-green-400 mt-0.5">✓</p>}
              {slipped && <p className="text-xs text-red-400 mt-0.5">!</p>}
              {isToday && !log && <p className="text-xs text-teal-400/60 mt-0.5">•</p>}
            </div>
          );
        })}
      </div>
      <p className="text-slate-500 text-xs mt-3">
        {isWeekly
          ? `Numbers = allowed session limit (${plan.unit}). ⭕ = zero-dose clean day. ✓ = met goal.`
          : `Numbers = daily target ${plan.unit}. ✓ = met goal. ⭕ = rest day.`}
      </p>
    </div>
  );
}
