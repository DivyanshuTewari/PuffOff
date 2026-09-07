import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';

export default function MilestoneItem({ milestone: m, index, achieved }) {
  const IconComponent = m.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`flex gap-4 pl-2 ${achieved ? '' : 'opacity-50'}`}
    >
      {/* Dot */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
          achieved
            ? 'bg-teal-500/25 border border-teal-500/40'
            : 'bg-slate-800 border border-white/10'
        }`}
      >
        {achieved ? (
          <CheckCircle size={14} className="text-teal-400" />
        ) : (
          <Lock size={12} className="text-slate-600" />
        )}
      </div>

      {/* Content */}
      <div
        className={`glass flex-1 p-4 mb-1 border ${
          achieved ? 'border-teal-500/20 bg-teal-500/5' : 'border-white/5'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <IconComponent size={16} />
            </div>
            <span className="font-semibold text-sm text-white">{m.title}</span>
          </div>
          <span
            className={`badge text-xs ${
              achieved ? 'bg-teal-500/20 text-teal-300' : 'bg-white/5 text-slate-500'
            }`}
          >
            {m.time}
          </span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
        {achieved && <p className="text-teal-400 text-xs font-medium mt-2">✅ Achieved!</p>}
      </div>
    </motion.div>
  );
}
