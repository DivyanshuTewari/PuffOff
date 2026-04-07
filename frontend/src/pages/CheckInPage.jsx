import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import { ClipboardCheck, Send, Smile, ThumbsUp, Meh, Frown, ThumbsDown } from 'lucide-react';

const MOODS = [
  { val: 'great',    icon: ThumbsUp, label: 'Great' },
  { val: 'good',     icon: Smile, label: 'Good' },
  { val: 'neutral',  icon: Meh, label: 'Neutral' },
  { val: 'bad',      icon: Frown, label: 'Bad' },
  { val: 'terrible', icon: ThumbsDown, label: 'Terrible' },
];

export default function CheckInPage() {
  const [addictions, setAddictions] = useState([]);
  const [form, setForm] = useState({ addictionId: '', urgeMeter: 5, triggers: '', mood: 'neutral', notes: '' });
  const [loading, setLoading] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  useEffect(() => {
    api.get('/api/addictions').then(r => {
      setAddictions(r.data.addictions);
      if (r.data.addictions.length > 0) setForm(f => ({ ...f, addictionId: r.data.addictions[0]._id }));
    });
    api.get('/api/checkins?limit=5').then(r => setRecentCheckIns(r.data.checkIns));
  }, []);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const urgeColor = (u) => {
    if (u <= 3) return 'text-green-400';
    if (u <= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  const urgeLabel = (u) => {
    if (u <= 2) return 'Very Low';
    if (u <= 4) return 'Low';
    if (u <= 6) return 'Moderate';
    if (u <= 8) return 'High';
    return 'Very High';
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.addictionId) { toast.error('Select an addiction to check in for'); return; }
    setLoading(true);
    try {
      await api.post('/api/checkins', { ...form, urgeMeter: parseInt(form.urgeMeter) });
      toast.success('Check-in logged! Keep going 💪');
      setForm(f => ({ ...f, urgeMeter: 5, triggers: '', notes: '', mood: 'neutral' }));
      const r = await api.get('/api/checkins?limit=5');
      setRecentCheckIns(r.data.checkIns);
    } catch {
      toast.error('Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck size={28} className="text-teal-400" />
          <h1 className="font-display font-bold text-3xl text-white">Daily Check-in</h1>
        </div>
        <p className="text-slate-400 mb-8">How are you feeling right now? Tracking urges helps you understand your patterns.</p>

        <form onSubmit={onSubmit} className="glass p-6 space-y-6 mb-8">
          {/* Addiction selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Which addiction? *</label>
            {addictions.length === 0 ? (
              <p className="text-slate-500 text-sm">No addictions tracked yet. <a href="/add-vice" className="text-teal-400">Add one first</a>.</p>
            ) : (
              <select id="checkin-addiction" name="addictionId" value={form.addictionId} onChange={onChange} className="input">
                {addictions.map(a => (
                  <option key={a._id} value={a._id} className="bg-slate-800 text-white">
                    {a.customName || a.viceName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Urge Meter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Urge Meter *</label>
              <div className="flex items-center gap-2">
                <span className={`font-display font-black text-3xl ${urgeColor(form.urgeMeter)}`}>{form.urgeMeter}</span>
                <span className={`text-sm ${urgeColor(form.urgeMeter)}`}>{urgeLabel(parseInt(form.urgeMeter))}</span>
              </div>
            </div>
            <div className="relative">
              <input id="checkin-urge" type="range" name="urgeMeter" min={1} max={10} value={form.urgeMeter} onChange={onChange}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #14b8a6 0%, #f59e0b 50%, #ef4444 100%)` }} />
              <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                <span>1 — Barely there</span>
                <span>10 — Overwhelming</span>
              </div>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Current Mood</label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button key={m.val} type="button" onClick={() => setForm(f => ({ ...f, mood: m.val }))}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all text-sm ${
                    form.mood === m.val
                      ? 'border-teal-500/50 bg-teal-500/15 text-teal-300'
                      : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/8'
                  }`}>
                  <m.icon size={22} className={form.mood === m.val ? 'text-teal-400' : 'text-slate-500'} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">What triggered this urge?</label>
            <input id="checkin-triggers" type="text" name="triggers" value={form.triggers} onChange={onChange}
              placeholder='e.g. "Feeling stressed at work", "Social pressure", "Boredom"'
              className="input" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Additional notes</label>
            <textarea id="checkin-notes" name="notes" value={form.notes} onChange={onChange}
              placeholder="Anything else on your mind right now?"
              rows={3} className="input resize-none" />
          </div>

          <button id="checkin-submit" type="submit" disabled={loading || addictions.length === 0}
            className="btn-primary w-full justify-center py-3">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Send size={16} /> Log Check-in</>}
          </button>
        </form>

        {/* Recent check-ins */}
        {recentCheckIns.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-lg text-white mb-4">Recent Check-ins</h2>
            <div className="space-y-3">
              {recentCheckIns.map(c => (
                <div key={c._id} className="glass p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                      ${c.urgeMeter <= 3 ? 'bg-green-500/20 text-green-400' : c.urgeMeter <= 6 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {c.urgeMeter}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 capitalize">{c.addictionId?.viceName || 'Unknown'}</p>
                      {c.triggers && <p className="text-xs text-slate-500">{c.triggers}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-600">{c.mood}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
