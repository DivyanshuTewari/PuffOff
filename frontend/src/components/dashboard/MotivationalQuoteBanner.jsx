import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Every moment clean is a testament to your incredible strength.",
  "You didn't come this far to only come this far.",
  "The cravings you resist today build the life you love tomorrow.",
  "Recovery is not a race. You don't have to feel guilty if it takes time.",
  "Your only job right now is to not use. Everything else can wait.",
];

export default function MotivationalQuoteBanner() {
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="glass p-5 border border-teal-500/15 mb-8 flex items-start gap-3"
    >
      <Sparkles size={18} className="text-teal-400 mt-0.5 shrink-0" />
      <p className="text-slate-300 italic text-sm leading-relaxed">"{quote}"</p>
    </motion.div>
  );
}
