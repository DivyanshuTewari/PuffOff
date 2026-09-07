import { Heart, Bell, Clock } from 'lucide-react';

export default function RescuerToolkit({ plan, viceName }) {
  return (
    <div className="space-y-5">
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
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> Hold a pen or pencil — replace the hand-to-mouth habit
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> Try 5 deep diaphragmatic breaths when an urge hits
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> Keep sugar-free gum or dark chocolate nearby
            </li>
          </ul>
        )}
        {viceName === 'chewing_tobacco' && (
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span> Pop a cardamom (Elaichi) — satisfies the oral fixation instantly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span> Cinnamon sticks or cloves work equally well
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span> Sunflower seeds keep your mouth busy productively
            </li>
          </ul>
        )}
        {viceName === 'alcohol' && (
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span> Drink sparkling water with lime — the ritual feels similar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span> Cold-brew tea or kombucha as an evening substitute
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span> Call a friend — social triggers are better handled socially
            </li>
          </ul>
        )}
        {!['nicotine', 'chewing_tobacco', 'alcohol'].includes(viceName) && (
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> When urge hits, do 20 push-ups or jog in place for 60 seconds
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> Have a glass of cold water — physiologically resets your state
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 mt-0.5">•</span> Text a support person immediately when you feel the pull
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
