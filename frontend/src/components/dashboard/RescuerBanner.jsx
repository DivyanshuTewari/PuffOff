import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function RescuerBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="mb-5"
    >
      <Link
        to="/rescuer"
        id="dashboard-rescuer-btn"
        className="group relative flex items-center justify-between gap-4 rounded-2xl p-5 overflow-hidden border border-orange-500/25 hover:border-orange-500/50 transition-all duration-300"
        style={{
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(225,29,72,0.10) 100%)',
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(249,115,22,0.18)' }}
        />
        <div
          className="absolute -bottom-6 left-12 w-24 h-24 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(225,29,72,0.12)' }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
          >
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-white leading-tight">The Rescuer</p>
            <p className="text-orange-200/70 text-sm mt-0.5">
              Smart tapering engine — quit gradually, not cold turkey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-orange-300/70 font-medium">4-Phase Plan</span>
            <div className="flex gap-1">
              {['Phase 1', 'Phase 2', 'Phase 3', 'Freedom'].map((p, i) => (
                <div
                  key={i}
                  className="w-5 h-1.5 rounded-full"
                  style={{ background: i === 0 ? '#f97316' : 'rgba(255,255,255,0.15)' }}
                />
              ))}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400 group-hover:text-orange-400"
                style={{ color: 'inherit' }}
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
