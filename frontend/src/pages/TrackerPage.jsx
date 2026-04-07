import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Calendar, Save, Trash2, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function TrackerPage() {
  const [addictions, setAddictions] = useState([]);
  const [selectedAddiction, setSelectedAddiction] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState('');
  const [moneySpent, setMoneySpent] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAddictions();
  }, []);

  useEffect(() => {
    if (selectedAddiction) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [selectedAddiction]);

  const fetchAddictions = async () => {
    try {
      const { data } = await api.get('/api/addictions');
      setAddictions(data.addictions);
      if (data.addictions.length > 0) {
        setSelectedAddiction(data.addictions[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load addictions');
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get(`/api/usagelogs?addictionId=${selectedAddiction}`);
      setLogs(data.logs);
    } catch (err) {
      toast.error('Failed to load logs');
    }
  };

  const currentAddiction = addictions.find(a => a._id === selectedAddiction);
  const currency = currentAddiction?.currency || 'USD';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddiction) return toast.error('Please select an addiction');
    
    setLoading(true);
    try {
      await api.post('/api/usagelogs', {
        addictionId: selectedAddiction,
        date: date,
        quantity: parseFloat(quantity) || 0,
        moneySpent: parseFloat(moneySpent) || 0,
        notes: notes
      });
      toast.success('Log saved!');
      setQuantity('');
      setMoneySpent('');
      setNotes('');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await api.delete(`/api/usagelogs/${id}`);
      toast.success('Deleted log');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let weekSpend = 0, monthSpend = 0, yearSpend = 0, totalSpend = 0;
    let weekQty = 0, totalQty = 0;

    logs.forEach(log => {
      const logDate = new Date(log.date);
      const money = log.moneySpent || 0;
      const qty = log.quantity || 0;

      totalSpend += money;
      totalQty += qty;

      if (logDate >= startOfWeek) { weekSpend += money; weekQty += qty; }
      if (logDate >= startOfMonth) { monthSpend += money; }
      if (logDate >= startOfYear) { yearSpend += money; }
    });

    return { weekSpend, monthSpend, yearSpend, totalSpend, weekQty, totalQty };
  }, [logs]);

  return (
    <div className="page max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex items-center gap-3 mb-2">
          <Activity size={28} className="text-teal-400" />
          <h1 className="font-display font-bold text-3xl text-white">Daily Tracker</h1>
        </div>
        <p className="text-slate-400 mb-8">Log your usage and expenses like a spreadsheet to understand your habits.</p>

        {/* Addiction Selector */}
        <div className="mb-6 max-w-sm">
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Addiction to Track</label>
          <select 
            value={selectedAddiction} 
            onChange={e => setSelectedAddiction(e.target.value)} 
            className="input w-full"
          >
            {addictions.map(a => (
              <option key={a._id} value={a._id} className="bg-slate-800 text-white">
                {a.customName || a.viceName}
              </option>
            ))}
          </select>
        </div>

        {selectedAddiction && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass p-4 rounded-2xl border border-teal-500/20">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><DollarSign size={13}/> This Week</div>
                <div className="font-display font-bold text-2xl text-white">{stats.weekSpend.toFixed(2)} <span className="text-sm font-normal text-slate-500">{currency}</span></div>
              </div>
              <div className="glass p-4 rounded-2xl border border-teal-500/10">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><DollarSign size={13}/> This Month</div>
                <div className="font-display text-xl text-white">{stats.monthSpend.toFixed(2)} <span className="text-sm font-normal text-slate-500">{currency}</span></div>
              </div>
              <div className="glass p-4 rounded-2xl border border-teal-500/10">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><DollarSign size={13}/> This Year</div>
                <div className="font-display text-xl text-white">{stats.yearSpend.toFixed(2)} <span className="text-sm font-normal text-slate-500">{currency}</span></div>
              </div>
              <div className="glass p-4 rounded-2xl border border-amber-500/20">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Activity size={13}/> Total Usage Quantity</div>
                <div className="font-display text-xl text-amber-400">{stats.totalQty} Units</div>
              </div>
            </div>

            {/* Input Form & Table */}
            <div className="glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-white/[0.02] border-b border-white/[0.05] flex items-center gap-2">
                <Calendar size={18} className="text-teal-400" />
                <h3 className="font-medium text-white">Log Entry Sheet</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-white/[0.03] text-xs uppercase text-slate-400 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Money Spent ({currency})</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Add New Row */}
                    <tr className="border-b border-teal-500/20 bg-teal-500/5">
                      <td className="px-4 py-3">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-md px-2 py-1 text-sm text-white outline-none focus:border-teal-400" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" placeholder="0" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-20 bg-slate-900/50 border border-white/10 rounded-md px-2 py-1 text-sm text-white outline-none focus:border-teal-400" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" placeholder="0.00" min="0" step="0.01" value={moneySpent} onChange={e => setMoneySpent(e.target.value)} className="w-24 bg-slate-900/50 border border-white/10 rounded-md px-2 py-1 text-sm text-white outline-none focus:border-teal-400" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-md px-2 py-1 text-sm text-white outline-none focus:border-teal-400" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={onSubmit} disabled={loading} className="btn-primary py-1 px-3 text-xs w-full justify-center">
                          <Save size={14} /> Add
                        </button>
                      </td>
                    </tr>

                    {/* Log Rows */}
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">No entries yet. Start logging your usage!</td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-white font-medium">{log.quantity}</td>
                          <td className="px-4 py-3 text-red-400">-{log.moneySpent.toFixed(2)}</td>
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{log.notes || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteLog(log._id)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Delete entry">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
