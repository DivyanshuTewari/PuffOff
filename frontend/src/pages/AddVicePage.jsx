import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Cigarette, Wine, Leaf, Pill, Zap, Dices, Layers } from 'lucide-react';

const VICES = [
  { id: 'nicotine',   label: 'Nicotine',    icon: Cigarette, desc: 'Cigarettes, vaping, chewing tobacco' },
  { id: 'alcohol',    label: 'Alcohol',     icon: Wine,      desc: 'Beer, wine, spirits' },
  { id: 'cannabis',   label: 'Cannabis',    icon: Leaf,      desc: 'Weed, THC products' },
  { id: 'opioids',    label: 'Opioids',     icon: Pill,      desc: 'Prescription or illicit opioids' },
  { id: 'stimulants', label: 'Stimulants',  icon: Zap,       desc: 'Cocaine, meth, Adderall misuse' },
  { id: 'gambling',   label: 'Gambling',    icon: Dices,     desc: 'Betting, casinos, online gambling' },
  { id: 'other',      label: 'Other',       icon: Layers,    desc: 'Any other habit you want to break' },
];

export default function AddVicePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({ customName: '', lastRelapseDate: '', dailySpending: '', currency: 'USD', motivationalNote: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!selected) { toast.error('Please select a vice type'); return; }
    setLoading(true);
    try {
      await api.post('/api/addictions', {
        viceName: selected,
        customName: form.customName,
        lastRelapseDate: form.lastRelapseDate || new Date().toISOString(),
        dailySpending: parseFloat(form.dailySpending) || 0,
        currency: form.currency,
        motivationalNote: form.motivationalNote,
      });
      toast.success('Vice added! Your timer starts now 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add vice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft size={17} /> Back
        </button>
        <h1 className="font-display font-bold text-3xl text-white mb-2">Track a Vice</h1>
        <p className="text-slate-400 mb-8">Select what you want to quit and we'll start counting your progress.</p>

        {/* Vice selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {VICES.map(v => (
            <button key={v.id} type="button" onClick={() => setSelected(v.id)}
              className={`group glass p-4 text-left transition-all duration-200 border ${
                selected === v.id
                  ? 'border-teal-500/50 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                  : 'border-white/5 hover:border-white/15 hover:bg-white/5'
              }`}>
              <div className="mb-2"><v.icon size={26} className={selected === v.id ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400 transition-colors'} /></div>
              <div className="font-semibold text-sm text-white mb-0.5">{v.label}</div>
              <div className="text-slate-500 text-xs leading-tight">{v.desc}</div>
            </button>
          ))}
        </div>

        {/* Details form */}
        <form onSubmit={onSubmit} className="glass p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Custom Name <span className="text-slate-500">(optional)</span></label>
            <input id="vice-customname" type="text" name="customName" value={form.customName} onChange={onChange}
              placeholder={selected ? `e.g. "My ${selected} habit"` : 'e.g. "My morning vice"'}
              className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              When was your last relapse? <span className="text-slate-500">(leave blank = right now)</span>
            </label>
            <input id="vice-relapse-date" type="datetime-local" name="lastRelapseDate" value={form.lastRelapseDate} onChange={onChange}
              className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Daily Spending</label>
              <input id="vice-spending" type="number" name="dailySpending" value={form.dailySpending} onChange={onChange}
                placeholder="0.00" min="0" step="0.01"
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
              <select id="vice-currency" name="currency" value={form.currency} onChange={onChange} className="input">
                {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your "Why" <span className="text-slate-500">(optional)</span></label>
            <textarea id="vice-note" name="motivationalNote" value={form.motivationalNote} onChange={onChange}
              placeholder="Why do you want to quit? (This will appear on your card as a reminder)"
              rows={3} className="input resize-none" />
          </div>

          <button id="vice-submit" type="submit" disabled={loading || !selected}
            className={`btn-primary w-full justify-center py-3 text-base ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Plus size={16} /> Start Tracking</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
