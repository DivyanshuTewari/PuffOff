import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Heart, Leaf, Coffee, Cigarette, Dumbbell, Droplets } from 'lucide-react';

const SUBSTITUTIONS = {
  nicotine: {
    icon: Wind,
    tip: 'Hold a pen or pencil — your hand-to-mouth habit needs a proxy. Take 5 deep breaths.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  chewing_tobacco: {
    icon: Leaf,
    tip: 'Pop a cardamom (Elaichi) or clove in your mouth. The spice satisfies the oral craving instantly.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  alcohol: {
    icon: Droplets,
    tip: 'Drink a tall glass of cold water with lemon. The ritual of pouring and sipping mimics the habit.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  cannabis: {
    icon: Wind,
    tip: 'Try box breathing: 4 counts in, 4 hold, 4 out, 4 hold. Repeat 4 times.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  gambling: {
    icon: Dumbbell,
    tip: 'Do 20 push-ups or a quick walk. Physical activity interrupts the dopamine craving cycle.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  default: {
    icon: Coffee,
    tip: 'Have a glass of water or chew sugar-free gum. Most urges peak at 3 minutes and fade by 15.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
};

const BREATHE_PHASES = [
  { label: 'Breathe In', duration: 4, color: 'from-teal-500 to-cyan-400' },
  { label: 'Hold', duration: 7, color: 'from-violet-500 to-purple-400' },
  { label: 'Breathe Out', duration: 8, color: 'from-rose-500 to-pink-400' },
];

const TOTAL_SECONDS = 15 * 60; // 15 minutes

export default function UrgeCooldownTimer({ viceName = 'default', onClose, onResisted }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [breatheIdx, setBreatheIdx] = useState(0);
  const [breatheCount, setBreatheCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const breatheRef = useRef(null);

  const sub = SUBSTITUTIONS[viceName] || SUBSTITUTIONS.default;
  const SubIcon = sub.icon;

  // Main countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Breathing cycle
  useEffect(() => {
    const phase = BREATHE_PHASES[breatheIdx];
    breatheRef.current = setTimeout(() => {
      const next = (breatheIdx + 1) % BREATHE_PHASES.length;
      setBreatheIdx(next);
      if (next === 0) setBreatheCount(c => c + 1);
    }, phase.duration * 1000);
    return () => clearTimeout(breatheRef.current);
  }, [breatheIdx]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / TOTAL_SECONDS;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const currentPhase = BREATHE_PHASES[breatheIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass w-full max-w-md rounded-3xl p-8 relative border border-white/10 shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 rounded-xl hover:bg-white/5 transition-all"
        >
          <X size={18} />
        </button>

        {!finished ? (
          <>
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm mb-1">Hold on. The urge will pass.</p>
              <h2 className="font-display font-bold text-2xl text-white">Delay the Dose</h2>
            </div>

            {/* Circular Timer */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
                  />
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke="url(#timerGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-4xl text-white">{mm}:{ss}</span>
                  <span className="text-slate-400 text-xs mt-1">remaining</span>
                </div>
              </div>
            </div>

            {/* Breathing Guide */}
            <div className={`rounded-2xl p-4 border mb-5 text-center bg-gradient-to-r ${currentPhase.color}/10 border-white/10`}>
              <motion.div
                key={breatheIdx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-lg font-bold bg-gradient-to-r ${currentPhase.color} bg-clip-text text-transparent mb-1`}
              >
                {currentPhase.label}
              </motion.div>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: currentPhase.duration }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentPhase.color}`}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * (currentPhase.duration / 10), repeat: Infinity, repeatType: 'reverse' }}
                  />
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">{breatheCount} cycles completed</p>
            </div>

            {/* Substitution Tip */}
            <div className={`rounded-2xl p-4 border ${sub.bg} flex items-start gap-3`}>
              <SubIcon size={18} className={`${sub.color} mt-0.5 shrink-0`} />
              <p className="text-slate-300 text-sm leading-relaxed">{sub.tip}</p>
            </div>
          </>
        ) : (
          /* Finished screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🌿
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">15 minutes done!</h2>
            <p className="text-slate-400 mb-6">How are you feeling? The urge usually fades after this.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'I survived! 💪', type: 'win', color: 'border-teal-500/40 hover:bg-teal-500/10 text-teal-400' },
                { label: 'Mostly okay 😮‍💨', type: 'partial', color: 'border-amber-500/40 hover:bg-amber-500/10 text-amber-400' },
                { label: 'I slipped 😔', type: 'slip', color: 'border-red-500/40 hover:bg-red-500/10 text-red-400' },
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => onResisted(opt.type)}
                  className={`glass p-3 rounded-xl border text-sm font-medium transition-all ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
