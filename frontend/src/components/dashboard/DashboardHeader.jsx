import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function DashboardHeader({ username }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Hey, <span className="text-gradient">{username || 'Friend'}</span> 👋
          </h1>
          <p className="text-slate-400">Here's your recovery overview for today.</p>
        </div>
        <Link to="/add-vice" id="dashboard-add-vice" className="btn-primary">
          <Plus size={16} /> Track New Vice
        </Link>
      </div>
    </motion.div>
  );
}
