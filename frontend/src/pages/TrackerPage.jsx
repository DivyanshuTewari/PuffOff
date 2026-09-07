import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Calendar, Activity } from 'lucide-react';

import { fetchAddictions, setSelectedAddiction } from '../store/slices/addictionsSlice';
import { fetchUsageLogs, addUsageLog, deleteUsageLog } from '../store/slices/trackerSlice';

import TrackerStatsGrid from '../components/tracker/TrackerStatsGrid';
import TrackerEntryForm from '../components/tracker/TrackerEntryForm';
import TrackerLogGroup from '../components/tracker/TrackerLogGroup';

export default function TrackerPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: addictions, selectedId: globalSelectedId } = useSelector((state) => state.addictions);
  const { logs, loading: logsLoading, submitting } = useSelector((state) => state.tracker);

  const [selectedAddiction, setLocalSelectedAddiction] = useState(globalSelectedId || '');

  useEffect(() => {
    dispatch(fetchAddictions());
  }, [dispatch]);

  useEffect(() => {
    if (addictions.length > 0 && !selectedAddiction) {
      const initialId = globalSelectedId || addictions[0]._id;
      setLocalSelectedAddiction(initialId);
      dispatch(setSelectedAddiction(initialId));
    }
  }, [addictions, globalSelectedId, selectedAddiction, dispatch]);

  useEffect(() => {
    if (selectedAddiction) {
      dispatch(fetchUsageLogs(selectedAddiction));
    }
  }, [selectedAddiction, dispatch]);

  const handleSelectAddiction = (id) => {
    setLocalSelectedAddiction(id);
    dispatch(setSelectedAddiction(id));
  };

  const currentAddiction = addictions.find((a) => a._id === selectedAddiction);
  const currencyCode = user?.currency || currentAddiction?.currency || 'INR';

  const handleAddLog = async ({ logDate, logTimeObj, quantity, moneySpent, notes, resetForm }) => {
    if (!selectedAddiction) {
      return toast.error('Please select an addiction');
    }

    let h24 = parseInt(logTimeObj.hour, 10) || 12;
    if (logTimeObj.period === 'PM' && h24 !== 12) h24 += 12;
    if (logTimeObj.period === 'AM' && h24 === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(logTimeObj.minute || '00').padStart(2, '0');

    const parsedQty = parseFloat(quantity);
    if (!parsedQty || parsedQty <= 0) {
      return toast.error('Please enter a quantity greater than 0');
    }

    const combinedDate = new Date(`${logDate}T${hStr}:${mStr}:00`);

    try {
      await dispatch(
        addUsageLog({
          addictionId: selectedAddiction,
          date: combinedDate.toISOString(),
          quantity: parsedQty,
          moneySpent: parseFloat(moneySpent) || 0,
          notes: notes,
        })
      ).unwrap();
      toast.success('Log saved!');
      resetForm();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save log');
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await dispatch(deleteUsageLog(id)).unwrap();
      toast.success('Deleted log');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete');
    }
  };

  // Calculations for stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let daySpend = 0, weekSpend = 0, monthSpend = 0, yearSpend = 0, totalSpend = 0;
    let dayQty = 0, weekQty = 0, monthQty = 0, yearQty = 0, totalQty = 0;

    logs.forEach((log) => {
      const logDate = new Date(log.date);
      const money = log.moneySpent || 0;
      const qty = log.quantity || 0;

      totalSpend += money;
      totalQty += qty;

      if (logDate >= startOfDay) { daySpend += money; dayQty += qty; }
      if (logDate >= startOfWeek) { weekSpend += money; weekQty += qty; }
      if (logDate >= startOfMonth) { monthSpend += money; monthQty += qty; }
      if (logDate >= startOfYear) { yearSpend += money; yearQty += qty; }
    });

    return { daySpend, weekSpend, monthSpend, yearSpend, totalSpend, dayQty, weekQty, monthQty, yearQty, totalQty };
  }, [logs]);

  // Group logs by day
  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach((log) => {
      const day = new Date(log.date).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[day]) {
        groups[day] = { dateStr: day, totalQty: 0, totalSpent: 0, entries: [] };
      }
      groups[day].totalQty += log.quantity;
      groups[day].totalSpent += log.moneySpent;
      groups[day].entries.push(log);
    });
    return Object.values(groups);
  }, [logs]);

  return (
    <div className="page max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Activity size={28} className="text-teal-400" />
          <h1 className="font-display font-bold text-3xl text-white">Daily Tracker</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Log your usage and expenses like a spreadsheet to understand your habits.
        </p>

        {/* Addiction Selector */}
        <div className="mb-6 max-w-sm">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Addiction to Track
          </label>
          <select
            value={selectedAddiction}
            onChange={(e) => handleSelectAddiction(e.target.value)}
            className="input w-full"
          >
            {addictions.map((a) => (
              <option key={a._id} value={a._id} className="bg-slate-800 text-white">
                {a.customName || a.viceName}
              </option>
            ))}
          </select>
        </div>

        {selectedAddiction && (
          <>
            {/* Stats Cards */}
            <TrackerStatsGrid stats={stats} currency={currencyCode} />

            {/* Input Form & Log List */}
            <div className="glass rounded-2xl overflow-hidden shadow-2xl mb-8">
              <div className="p-4 bg-white/[0.02] border-b border-white/[0.05] flex items-center gap-2">
                <Calendar size={18} className="text-teal-400" />
                <h3 className="font-medium text-white">Log Entry Sheet</h3>
              </div>

              {/* Form Component */}
              <TrackerEntryForm
                onSubmit={handleAddLog}
                loading={submitting}
                currency={currencyCode}
              />

              {/* Log List Component */}
              <TrackerLogGroup
                groupedLogs={groupedLogs}
                currentAddiction={currentAddiction}
                onDeleteLog={handleDeleteLog}
                currency={currencyCode}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
