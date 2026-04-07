import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Wind, Quote, Phone, Heart, RefreshCw, MessageSquare, Users, Leaf, UserPlus, ShieldPlus } from 'lucide-react';

const QUOTES = [
  { text: "You are stronger than your cravings. This moment will pass.", author: "Recovery Wisdom" },
  { text: "Every urge you resist is a victory. You are winning right now.", author: "PuffOff" },
  { text: "The cravings are loudest right before they give up. Hang on.", author: "Anonymous" },
  { text: "You didn't come this far to only come this far.", author: "Unknown" },
  { text: "Your body is healing. Your brain is lying. Trust the process.", author: "Recovery Coach" },
  { text: "One breath at a time. One minute at a time. One hour at a time.", author: "PuffOff" },
  { text: "Relapse is not the end of the road. It's a bump on the journey.", author: "SAMHSA" },
  { text: "The bravest thing you can do is ask for help.", author: "Recovery Wisdom" },
];

const HOTLINES = [
  { name: 'SAMHSA Helpline', number: '1-800-662-4357', desc: 'Free, confidential treatment referrals — 24/7', icon: Phone },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', desc: 'Text-based crisis counseling — 24/7', icon: MessageSquare },
  { name: 'National Suicide Prevention', number: '988', desc: 'Call or text 988 for immediate support', icon: AlertTriangle },
  { name: 'AA World Services', number: '1-212-870-3400', desc: 'Alcoholics Anonymous support line', icon: Users },
  { name: 'Narcotics Anonymous', number: '1-818-773-9999', desc: 'Substance use support & meeting finder', icon: Leaf },
];

const BREATHING_STEPS = [
  { label: 'Breathe In',  duration: 4, color: '#14b8a6', instruction: 'Slowly inhale through your nose...' },
  { label: 'Hold',        duration: 4, color: '#a78bfa', instruction: 'Hold your breath...' },
  { label: 'Breathe Out', duration: 6, color: '#60a5fa', instruction: 'Slowly exhale through your mouth...' },
  { label: 'Rest',        duration: 2, color: '#4ade80', instruction: 'Rest before the next breath...' },
];

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let s = step, c = 0;
    const tick = () => {
      c++;
      setCount(c);
      if (c >= BREATHING_STEPS[s].duration) {
        c = 0;
        s = (s + 1) % BREATHING_STEPS.length;
        if (s === 0) setCycles(prev => prev + 1);
        setStep(s);
      }
    };
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const stop = () => { setActive(false); setStep(0); setCount(0); clearInterval(intervalRef.current); };

  const cur = BREATHING_STEPS[step];
  const pct = active ? (count / cur.duration) * 100 : 0;

  return (
    <div className="text-center">
      {!active ? (
        <button onClick={() => setActive(true)}
          className="btn-primary mx-auto py-4 px-8 text-base">
          <Wind size={18} /> Start 4-4-6-2 Box Breathing
        </button>
      ) : (
        <div className="space-y-6">
          {/* Circle */}
          <div className="relative w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="80" cy="80" r="70" fill="none" stroke={cur.color} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ scale: cur.label === 'Breathe In' ? [1, 1.15] : cur.label === 'Breathe Out' ? [1.15, 1] : 1 }}
                transition={{ duration: cur.duration, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full animate-breathe"
                style={{ background: `radial-gradient(circle, ${cur.color}40, ${cur.color}10)`, border: `2px solid ${cur.color}50` }}
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-2xl" style={{ color: cur.color }}>{cur.label}</span>
              <span className="text-white font-mono text-lg">{cur.duration - count}s</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm">{cur.instruction}</p>
          <p className="text-slate-500 text-xs">Cycle {cycles + 1} · Do 4–6 cycles for best effect</p>
          <button onClick={stop} className="btn-outline mx-auto text-sm py-2">Stop</button>
        </div>
      )}
    </div>
  );
}

export default function EmergencyPage() {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [tab, setTab] = useState('breathe');
  const { user } = useAuth();

  const contacts = user?.emergencyContacts || [];

  const newQuote = () => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
  };

  return (
    <div className="page max-w-3xl">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        {/* Header */}
        <div className="glass p-6 mb-6 bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/25 text-center">
          <AlertTriangle size={36} className="text-amber-400 mx-auto mb-3" />
          <h1 className="font-display font-bold text-3xl text-white mb-2">Emergency Support</h1>
          <p className="text-slate-400">You're having a tough moment. That's OK. Let's get through this together.</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Heart size={14} className="text-red-400" />
            <span className="text-slate-400 text-sm">This urge will pass. Urges typically peak at 15–20 minutes.</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'breathe', label: 'Breathe', icon: Wind },
            { id: 'circle',  label: 'My Circle', icon: Heart },
            { id: 'hotline', label: 'Global', icon: Phone },
            { id: 'quote',   label: 'Quote', icon: Quote },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                tab === t.id
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                  : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/8'
              }`}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'circle' && (
            <motion.div key="circle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="font-display font-bold text-xl text-white mb-1">My Circle of Support</h2>
                <p className="text-slate-500 text-sm">Reach out to the people who care about you most.</p>
              </div>
              
              {contacts.length === 0 ? (
                <div className="glass p-8 text-center border-dashed border-white/10">
                  <Heart size={32} className="text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">You haven't added any personal supporters yet.</p>
                  <a href="/profile" className="btn-primary inline-flex">Go to Profile to Add</a>
                </div>
              ) : (
                contacts.map((c, i) => (
                  <div key={i} className="glass p-5 border border-pink-500/10 group hover:border-pink-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                          <Heart size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-white mb-0.5">{c.name}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs px-2 py-0.5 bg-white/5 rounded text-slate-400 capitalize">{c.relationship}</span>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400/80">{c.supportType}</span>
                          </div>
                        </div>
                      </div>
                      <a href={`tel:${c.phone}`} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all group-hover:scale-105">
                         <Phone size={22} fill="currentColor" className="fill-transparent" />
                         <span className="text-[10px] font-bold uppercase tracking-tight">Call Now</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
              <p className="text-center text-slate-600 text-xs pt-4">Your circle is private and encrypted. Only you can see these contacts.</p>
            </motion.div>
          )}

          {tab === 'breathe' && (
            <motion.div key="breathe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass p-8">
              <h2 className="font-display font-bold text-xl text-white text-center mb-2">Breathing Exercise</h2>
              <p className="text-slate-400 text-sm text-center mb-8">Box breathing (4-4-6-2) activates your parasympathetic nervous system and reduces acute craving intensity.</p>
              <BreathingExercise />
            </motion.div>
          )}

          {tab === 'quote' && (
            <motion.div key="quote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass p-8 text-center">
              <Quote size={32} className="text-violet-400 mx-auto mb-6" />
              <AnimatePresence mode="wait">
                <motion.div key={quote.text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="text-white text-xl font-medium leading-relaxed mb-4 font-display">"{quote.text}"</p>
                  <p className="text-slate-500 text-sm">— {quote.author}</p>
                </motion.div>
              </AnimatePresence>
              <button onClick={newQuote} className="btn-outline mx-auto mt-8 text-sm">
                <RefreshCw size={14} /> New Quote
              </button>
            </motion.div>
          )}

          {tab === 'hotline' && (
            <motion.div key="hotline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3">
              {HOTLINES.map((h, i) => (
                <div key={i} className="glass p-4 flex items-center gap-4 border border-white/5">
                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <h.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">{h.name}</p>
                    <p className="text-xs text-slate-500">{h.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm text-teal-400 font-bold">{h.number}</p>
                    <p className="text-xs text-slate-600">Free & confidential</p>
                  </div>
                </div>
              ))}
              <p className="text-center text-slate-600 text-xs pt-2">Not a substitute for professional care. Please reach out to a licensed healthcare provider.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
