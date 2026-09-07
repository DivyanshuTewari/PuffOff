import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchAddictions } from '../store/slices/addictionsSlice';
import { fetchRescuerPlans } from '../store/slices/rescuerSlice';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSummaryCards from '../components/dashboard/DashboardSummaryCards';
import MotivationalQuoteBanner from '../components/dashboard/MotivationalQuoteBanner';
import RescuerBanner from '../components/dashboard/RescuerBanner';
import QuickLinksGrid from '../components/dashboard/QuickLinksGrid';
import AddictionCard from '../components/AddictionCard';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: addictions, loading: addictionsLoading } = useSelector((state) => state.addictions);
  const { plans: rescuerPlans, loading: plansLoading } = useSelector((state) => state.rescuer);

  useEffect(() => {
    dispatch(fetchAddictions()).unwrap().catch(() => {
      toast.error('Failed to load addictions');
    });
    dispatch(fetchRescuerPlans()).unwrap().catch(() => {
      // ignore optional plans failure
    });
  }, [dispatch]);

  // Build map: addictionId -> planId
  const rescuerPlanMap = useMemo(() => {
    const map = {};
    (rescuerPlans || []).forEach((p) => {
      const aid = p.addictionId?._id || p.addictionId;
      map[aid] = p._id;
    });
    return map;
  }, [rescuerPlans]);

  const loading = addictionsLoading && addictions.length === 0;

  return (
    <div className="page">
      {/* Header */}
      <DashboardHeader username={user?.username} />

      {/* Summary cards */}
      <DashboardSummaryCards addictions={addictions} currency={user?.currency || 'INR'} />

      {/* Daily quote */}
      <MotivationalQuoteBanner />

      {/* The Rescuer CTA Banner */}
      <RescuerBanner />

      {/* Quick links */}
      <QuickLinksGrid />

      {/* Addictions grid header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-white">Your Vices</h2>
        {addictions.length > 0 && (
          <Link to="/add-vice" className="text-teal-400 text-sm hover:text-teal-300">
            + Add more
          </Link>
        )}
      </div>

      {/* Addictions grid / loading / empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : addictions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass text-center py-20 border border-dashed border-white/10"
        >
          <Leaf size={48} className="mx-auto text-teal-500/50 mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No vices tracked yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Add your first addiction to start tracking your clean time and savings.
          </p>
          <Link to="/add-vice" className="btn-primary mx-auto">
            <Plus size={16} /> Add Your First Vice
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {addictions.map((a) => (
            <AddictionCard
              key={a._id}
              addiction={a}
              rescuerPlanId={rescuerPlanMap[a._id] || null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
