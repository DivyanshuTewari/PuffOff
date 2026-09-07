import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';

const QUICK_LINKS = [
  { to: '/checkin', label: 'Daily Check-in', icon: ClipboardCheck, color: 'text-teal-400', bg: 'hover:bg-teal-500/10' },
  { to: '/milestones', label: 'Milestones', icon: TrendingUp, color: 'text-violet-400', bg: 'hover:bg-violet-500/10' },
  { to: '/journal', label: 'Journal', icon: BookOpen, color: 'text-blue-400', bg: 'hover:bg-blue-500/10' },
  { to: '/emergency', label: 'Emergency Help', icon: AlertTriangle, color: 'text-amber-400', bg: 'hover:bg-amber-500/10' },
];

export default function QuickLinksGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
    >
      {QUICK_LINKS.map(({ to, label, icon: Icon, color, bg }) => (
        <Link
          key={to}
          to={to}
          className={`glass flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 ${bg} border border-white/5 hover:border-white/10`}
        >
          <Icon size={22} className={color} />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </Link>
      ))}
    </motion.div>
  );
}
