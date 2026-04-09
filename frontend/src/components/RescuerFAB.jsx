import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

/**
 * Floating Rescuer Action Button — fixed bottom-left on all auth pages.
 * Tooltip is absolutely positioned so the FAB itself never moves on hover.
 */
export default function RescuerFAB() {
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(false);

  // Hide on Rescuer pages
  if (pathname.startsWith('/rescuer')) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Tooltip — absolutely positioned, pops out to the RIGHT of the FAB */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div
              className="glass px-3 py-1.5 rounded-xl border border-orange-500/25 whitespace-nowrap"
              style={{ background: 'rgba(20,10,5,0.85)' }}
            >
              <span className="text-sm font-semibold text-white">The Rescuer</span>
              <span className="text-orange-300/70 font-normal ml-1.5 text-xs">· Tapering Engine</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — never moves */}
      <Link
        to="/rescuer"
        id="rescuer-fab"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open The Rescuer"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30"
          style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
        >
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.55, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #e11d48)' }}
          />
          <Activity size={22} className="text-white relative z-10" />
        </motion.div>
      </Link>
    </div>
  );
}
