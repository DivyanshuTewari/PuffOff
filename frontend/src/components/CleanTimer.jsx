import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

export default function CleanTimer({ lastRelapseDate }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date(lastRelapseDate).getTime());
      const s = Math.floor(diff / 1000);
      setT({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastRelapseDate]);

  return (
    <div className="flex items-center gap-2">
      <Clock size={13} className="text-teal-400 shrink-0" />
      <div className="flex items-center gap-0.5 font-mono text-sm">
        <span className="text-teal-400 font-bold">{pad(t.d)}</span>
        <span className="text-slate-500 text-xs mx-0.5">d</span>
        <span className="text-teal-400 font-bold">{pad(t.h)}</span>
        <span className="text-slate-500 text-xs mx-0.5">h</span>
        <span className="text-teal-400 font-bold">{pad(t.m)}</span>
        <span className="text-slate-500 text-xs mx-0.5">m</span>
        <span className="text-slate-400 font-bold">{pad(t.s)}</span>
        <span className="text-slate-500 text-xs mx-0.5">s</span>
      </div>
    </div>
  );
}
