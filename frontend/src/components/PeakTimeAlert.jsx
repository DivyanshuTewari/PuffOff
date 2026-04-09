import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Droplets } from 'lucide-react';

/**
 * Parses "HH:MM" string (24h) into { hours, minutes }
 */
function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
}

/**
 * Returns minutes until the next occurrence of a given time.
 * Negative if the time has already passed today.
 */
function minutesUntil(timeStr) {
  const now = new Date();
  const { hours, minutes } = parseTime(timeStr);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  return (target - now) / 60000;
}

export default function PeakTimeAlert({ urgeMap = [], viceName = '' }) {
  const [alert, setAlert] = useState(null); // { time, label }
  const [dismissed, setDismissed] = useState(new Set());
  const notifSentRef = useRef(new Set());

  useEffect(() => {
    if (!urgeMap.length) return;

    const check = () => {
      for (const entry of urgeMap) {
        const key = `${entry.time}-${new Date().toDateString()}`;
        if (dismissed.has(key) || notifSentRef.current.has(key)) continue;

        const minsUntil = minutesUntil(entry.time);
        // Fire alert 15 minutes before
        if (minsUntil > 0 && minsUntil <= 15) {
          notifSentRef.current.add(key);
          setAlert({ ...entry, key });

          // Try browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚠️ Peak Urge Time Approaching', {
              body: `Your ${entry.label || entry.time} peak is in ${Math.round(minsUntil)} min. Have a glass of water now!`,
              icon: '/favicon.ico',
            });
          }
          break; // Only show one alert at a time
        }
      }
    };

    check();
    const interval = setInterval(check, 60000); // check every minute
    return () => clearInterval(interval);
  }, [urgeMap, dismissed]);

  const dismiss = () => {
    if (alert) {
      setDismissed(prev => new Set([...prev, alert.key]));
      setAlert(null);
    }
  };

  // Format time to 12h display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const { hours, minutes } = parseTime(timeStr);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.key}
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          className="mb-4 glass rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3"
        >
          <Bell size={18} className="text-amber-400 mt-0.5 shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-amber-300 font-semibold text-sm">
              Your {formatTime(alert.time)} peak is coming up
            </p>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Droplets size={11} />
              Have a glass of water or chew gum now — stay ahead of it.
            </p>
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5">
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
