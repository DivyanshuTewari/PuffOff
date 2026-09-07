import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp } from 'lucide-react';

import { fetchAddictions } from '../store/slices/addictionsSlice';
import { MILESTONES, DEFAULT_MILESTONES } from '../components/milestones/milestonesData';
import MilestonesList from '../components/milestones/MilestonesList';

export default function MilestonesPage() {
  const dispatch = useDispatch();
  const { items: addictions, loading } = useSelector((state) => state.addictions);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchAddictions());
  }, [dispatch]);

  useEffect(() => {
    if (addictions.length > 0 && !selected) {
      setSelected(addictions[0]);
    } else if (selected) {
      // Keep selected in sync if updated
      const refreshed = addictions.find((a) => a._id === selected._id);
      if (refreshed) setSelected(refreshed);
    }
  }, [addictions, selected]);

  const milestones = selected
    ? MILESTONES[selected.viceName] || DEFAULT_MILESTONES
    : [];

  const minutesClean = selected
    ? Math.max(0, (Date.now() - new Date(selected.lastRelapseDate).getTime()) / 60000)
    : 0;

  return (
    <div className="page max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} className="text-violet-400" />
          <h1 className="font-display font-bold text-3xl text-white">Health Milestones</h1>
        </div>
        <p className="text-slate-400 mb-8">
          See what's happening in your body as it heals. Science-backed recovery timeline.
        </p>

        {addictions.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {addictions.map((a) => (
              <button
                key={a._id}
                onClick={() => setSelected(a)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                  selected?._id === a._id
                    ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                    : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/8'
                }`}
              >
                {a.customName || a.viceName}
              </button>
            ))}
          </div>
        )}

        {addictions.length === 0 && !loading ? (
          <div className="glass text-center py-16">
            <TrendingUp size={40} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Add a vice first to see your recovery milestones.</p>
          </div>
        ) : (
          <MilestonesList milestones={milestones} minutesClean={minutesClean} />
        )}
      </motion.div>
    </div>
  );
}
