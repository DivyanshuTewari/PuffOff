import { Map } from 'lucide-react';

export default function RescuerRoadmap({ plan }) {
  const b = plan.baselineQuantity || plan.baselineDaily;
  const u = plan.unit;
  const currentPhase = plan.currentPhase;
  const isWeekly = plan.frequency === 'weekly';

  let p1Text = '';
  let p2Text = '';
  let p3Text = '';
  let p4Text = '';

  if (isWeekly) {
    p1Text = `Session Volume Cap: Cap your weekly intake to ${(b * 0.8).toFixed(1)} ${u} per session. Delay cues and establish conscious control.`;
    p2Text = `Interval Extension: Lengthen clean gaps between sessions from 7 days to 9-12 days, while dropping session volume.`;
    p3Text = `Micro-Session Phase: Only a small micro-dose (max ${(b * 0.3).toFixed(1)} ${u}) once every 14-21 days.`;
    p4Text = `Total Freedom: Zero sessions permanently. Permanent neurological decoupling.`;
  } else if (b >= 10) {
    p1Text = `Initial Stabilization: Cut to ${(b * 0.8).toFixed(0)} ${u}/day. Delay your first morning dose by 30-45 minutes.`;
    p2Text = `Hyperbolic Reduction: Reduce by 12-15% of current dose each week down to 2 ${u}/day without receptor shock.`;
    p3Text = `Consolidation Days: Alternate between 1-2 ${u} one day and 0 ${u} the next day.`;
    p4Text = `Total Freedom: 0 ${u}/day permanently. Focus on relapse shield & clean streak.`;
  } else if (b >= 3) {
    p1Text = `Stabilization: Step down to ${(b * 0.8).toFixed(0)} ${u}/day. Time-shift cues and substitute oral fixation.`;
    p2Text = `Step-Down Taper: Reduce by 1 ${u} each week down to 1 ${u}/day.`;
    p3Text = `Day-Skipping: Alternate 1 ${u} one day, 0 ${u} the next.`;
    p4Text = `Total Freedom: 0 ${u}/day permanently.`;
  } else {
    // Low / Habitual volume (e.g. 1 packet/day, 1-2 units/day)
    p1Text = `Time Shifting: Micro-cut to ${(b * 0.8).toFixed(1)} ${u}/day. Focus on adding 45 minutes of delay before each urge.`;
    p2Text = `Micro-Dose Taper: Step down by fractions (${(b * 0.8).toFixed(1)} → ${(b * 0.5).toFixed(1)} → ${(b * 0.25).toFixed(1)} ${u}/day).`;
    p3Text = `Intermittent Days: Alternate between a micro-dose one day and a full clean zero-dose day the next.`;
    p4Text = `Total Freedom: 0 ${u}/day permanently.`;
  }

  const phases = [
    { num: 1, title: isWeekly ? 'Session Capping' : 'Stabilization', text: p1Text, active: currentPhase === 1 },
    { num: 2, title: isWeekly ? 'Interval Extension' : 'Hyperbolic Taper', text: p2Text, active: currentPhase === 2 },
    { num: 3, title: isWeekly ? 'Micro-Session' : 'Critical Minimum', text: p3Text, active: currentPhase === 3 },
    { num: 4, title: 'Freedom', text: p4Text, active: currentPhase === 4 },
  ];

  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Map size={16} className="text-slate-400" /> Your Personal Roadmap
      </h2>
      <div className="space-y-4">
        {phases.map((p) => (
          <div
            key={p.num}
            className={`flex items-start gap-4 transition-all ${
              p.active ? 'opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
          >
            <div
              className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                p.active
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'bg-white/10 border-white/20 text-slate-400'
              }`}
            >
              {p.num}
            </div>
            <div>
              <h3 className={`font-semibold ${p.active ? 'text-orange-400' : 'text-slate-200'}`}>
                Phase {p.num}: {p.title}{' '}
                {p.active && (
                  <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
                    Current
                  </span>
                )}
              </h3>
              <p
                className={`text-sm mt-1 leading-relaxed ${
                  p.active ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {p.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
