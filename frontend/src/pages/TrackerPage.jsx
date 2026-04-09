import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Calendar, Save, Trash2, TrendingDown, Banknote, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TrackerPage() {
  const { user } = useAuth();
  const [addictions, setAddictions] = useState([]);
  const [selectedAddiction, setSelectedAddiction] = useState('');
  const [logs, setLogs] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form state
  const [logDate, setLogDate] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
  });
  const [logTimeObj, setLogTimeObj] = useState(() => {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hour: String(h).padStart(2, '0'), minute: m, period: p };
  });
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
  const currencyCode = user?.currency || currentAddiction?.currency || 'INR';
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddiction) return toast.error('Please select an addiction');
    
    let h24 = parseInt(logTimeObj.hour, 10) || 12;
    if (logTimeObj.period === 'PM' && h24 !== 12) h24 += 12;
    if (logTimeObj.period === 'AM' && h24 === 12) h24 = 0;
    const hStr = String(h24).padStart(2, '0');
    const mStr = String(logTimeObj.minute || '00').padStart(2, '0');
    
    const parsedQty = parseFloat(quantity);
    if (!parsedQty || parsedQty < 1) {
      return toast.error('Please enter a quantity of at least 1');
    }
    
    const combinedDate = new Date(`${logDate}T${hStr}:${mStr}:00`);
    setLoading(true);
    try {
      await api.post('/api/usagelogs', {
        addictionId: selectedAddiction,
        date: combinedDate.toISOString(),
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
    try {
      await api.delete(`/api/usagelogs/${id}`);
      toast.success('Deleted log');
      setConfirmDeleteId(null);
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

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let daySpend = 0, weekSpend = 0, monthSpend = 0, yearSpend = 0, totalSpend = 0;
    let dayQty = 0, weekQty = 0, monthQty = 0, yearQty = 0, totalQty = 0;

    logs.forEach(log => {
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

  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const day = new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[day]) {
        groups[day] = { dateStr: day, totalQty: 0, totalSpent: 0, entries: [] };
      }
      groups[day].totalQty += log.quantity;
      groups[day].totalSpent += log.moneySpent;
      groups[day].entries.push(log);
    });
    return Object.values(groups);
  }, [logs]);

  const toggleExpand = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <div className="glass p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Banknote size={13}/> Today</div>
                <div className="font-display font-bold text-2xl text-teal-400 mb-1">{currencySymbol}{stats.daySpend.toFixed(2)}</div>
                <div className="text-xs text-teal-400/70 flex items-center gap-1"><Activity size={12}/> {stats.dayQty || 0} units</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-teal-500/20">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Banknote size={13}/> This Week</div>
                <div className="font-display font-bold text-2xl text-white mb-1">{currencySymbol}{stats.weekSpend.toFixed(2)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Activity size={12}/> {stats.weekQty || 0} units</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-teal-500/10">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Banknote size={13}/> This Month</div>
                <div className="font-display text-xl text-white mb-1">{currencySymbol}{stats.monthSpend.toFixed(2)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Activity size={12}/> {stats.monthQty || 0} units</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-teal-500/10">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Banknote size={13}/> This Year</div>
                <div className="font-display text-xl text-white mb-1">{currencySymbol}{stats.yearSpend.toFixed(2)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><Activity size={12}/> {stats.yearQty || 0} units</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-amber-500/20">
                <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Banknote size={13}/> Lifetime Total</div>
                <div className="font-display text-xl text-amber-400 mb-1">{currencySymbol}{stats.totalSpend.toFixed(2)}</div>
                <div className="text-xs text-amber-400/70 flex items-center gap-1"><Activity size={12}/> {stats.totalQty || 0} units</div>
              </div>
            </div>

            {/* Input Form & Log List */}
            <div className="glass rounded-2xl overflow-hidden shadow-2xl mb-8">
              <div className="p-4 bg-white/[0.02] border-b border-white/[0.05] flex items-center gap-2">
                <Calendar size={18} className="text-teal-400" />
                <h3 className="font-medium text-white">Log Entry Sheet</h3>
              </div>
              
              {/* Responsive Input Form */}
              <div className="p-4 bg-teal-500/5 border-b border-teal-500/20">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  {/* Date & Time Group */}
                  <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
                    <div className="flex-1 md:w-36">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">Date</label>
                      <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="input w-full py-2" />
                    </div>
                    <div className="flex-1 md:w-[124px]">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">Time</label>
                      <div className="flex items-center h-[38px] bg-slate-900/50 border border-white/10 rounded-md overflow-hidden focus-within:border-teal-400">
                        <input type="text" maxLength={2} value={logTimeObj.hour} 
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length === 2 && parseInt(val) > 12) val = '12';
                            setLogTimeObj(prev => ({...prev, hour: val}));
                          }}
                          onBlur={e => {
                            let val = e.target.value;
                            if (!val || parseInt(val) === 0) val = '12';
                            else val = String(parseInt(val)).padStart(2, '0');
                            setLogTimeObj(prev => ({...prev, hour: val}));
                          }}
                          className="w-8 shrink-0 bg-transparent text-center text-white outline-none text-sm" />
                        <span className="text-white/30 truncate">:</span>
                        <input type="text" maxLength={2} value={logTimeObj.minute} 
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length === 2 && parseInt(val) > 59) val = '59';
                            setLogTimeObj(prev => ({...prev, minute: val}));
                          }}
                          onBlur={e => {
                            let val = e.target.value;
                            if (!val) val = '00';
                            else val = String(parseInt(val)).padStart(2, '0');
                            setLogTimeObj(prev => ({...prev, minute: val}));
                          }}
                          className="w-8 shrink-0 bg-transparent text-center text-white outline-none text-sm" />
                        <button type="button" 
                          onClick={() => setLogTimeObj(prev => ({...prev, period: prev.period === 'AM' ? 'PM' : 'AM'}))} 
                          className="flex-1 min-w-[34px] px-1 h-full text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 active:bg-teal-500/30 outline-none transition-colors border-l border-white/5">
                          {logTimeObj.period}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Qty & Spent Group */}
                  <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
                    <div className="flex-1 md:w-20">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">Qty</label>
                      <input type="number" placeholder="1" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="input w-full py-2" />
                    </div>
                    <div className="flex-1 md:w-24">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">Spent ({currencySymbol})</label>
                      <input type="number" placeholder="0.00" min="0" step="0.01" value={moneySpent} onChange={e => setMoneySpent(e.target.value)} className="input w-full py-2" />
                    </div>
                  </div>
                  
                  {/* Notes & Submit Group */}
                  <div className="w-full md:flex-1 shrink-0">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">Notes <span className="lowercase normal-case opacity-60">(opt)</span></label>
                    <input type="text" placeholder="Notes?" value={notes} onChange={e => setNotes(e.target.value)} className="input w-full py-2" />
                  </div>
                  <div className="w-full md:w-auto shrink-0 mt-1 md:mt-0">
                    <button onClick={onSubmit} disabled={loading} className="btn-primary w-full md:w-auto whitespace-nowrap justify-center py-2 px-5 h-[42px] min-w-[120px]">
                      <Save size={15} /> Add Entry
                    </button>
                  </div>
                </div>
              </div>

              {/* Responsive Log List */}
              <div className="p-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                {groupedLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 italic">No entries yet. Start logging your usage!</div>
                ) : (
                  groupedLogs.map((group) => {
                    const isExpanded = expandedDays[group.dateStr];
                    return (
                      <div key={group.dateStr} className="glass rounded-xl border border-white/5 overflow-hidden transition-all">
                        {/* Summary Header */}
                        <div 
                          onClick={() => toggleExpand(group.dateStr)}
                          className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <button className="text-slate-400 hover:text-white transition-colors">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <span className="font-semibold text-white/90 mr-1">{group.dateStr}</span>
                            <span className="badge bg-teal-500/20 text-teal-300 capitalize text-[10px]">
                              {currentAddiction?.customName || currentAddiction?.viceName}
                            </span>
                            <span className="badge bg-white/5 text-slate-300 text-[10px]">
                              {group.entries.length} {group.entries.length === 1 ? 'Entry' : 'Entries'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-end">
                            <div className="text-right border-r border-white/10 pr-4">
                              <span className="text-slate-500 text-[10px] uppercase tracking-wider mr-2">Qty:</span>
                              <span className="font-medium text-white">{group.totalQty}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 text-[10px] uppercase tracking-wider mr-2">Spent:</span>
                              <span className="font-medium text-red-400">-{currencySymbol}{group.totalSpent.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Individual Entries expanded */}
                        {isExpanded && (
                          <div className="bg-slate-900/40 border-t border-white/5 divide-y divide-white/5">
                            {group.entries.map(log => (
                               <div key={log._id} className="p-3 pl-12 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:bg-white/[0.02] transition-colors">
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-xs text-slate-300 font-medium">
                                      {new Date(log.date).toLocaleTimeString([], { timeStyle: 'short' })}
                                    </span>
                                    {log.notes && <span className="text-sm text-slate-400 mt-0.5 truncate" title={log.notes}>{log.notes}</span>}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                                      <span className="text-sm font-medium text-white/80">{log.quantity} units</span>
                                      <span className="text-sm font-medium text-red-400/80">-{currencySymbol}{log.moneySpent.toFixed(2)}</span>
                                      {confirmDeleteId === log._id ? (
                                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                                          <button onClick={(e) => { e.stopPropagation(); deleteLog(log._id); }}
                                            className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all">
                                            Delete
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                            className="px-2 py-1 text-xs font-semibold bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all">
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(log._id); }}
                                          className="ml-auto sm:ml-0 p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-red-500/10" title="Delete entry">
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                   </div>
                               </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
