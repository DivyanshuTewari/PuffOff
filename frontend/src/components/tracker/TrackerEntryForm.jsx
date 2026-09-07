import { useState } from 'react';
import { Save } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export default function TrackerEntryForm({ onSubmit, loading, currency = 'INR' }) {
  const [logDate, setLogDate] = useState(() => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
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

  const currencySymbol = getCurrencySymbol(currency);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      logDate,
      logTimeObj,
      quantity,
      moneySpent,
      notes,
      resetForm: () => {
        setQuantity('');
        setMoneySpent('');
        setNotes('');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-teal-500/5 border-b border-teal-500/20">
      <div className="flex flex-col md:flex-row gap-3 items-end">
        {/* Date & Time Group */}
        <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="flex-1 md:w-36">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="input w-full py-2"
            />
          </div>
          <div className="flex-1 md:w-[124px]">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">
              Time
            </label>
            <div className="flex items-center h-[38px] bg-slate-900/50 border border-white/10 rounded-md overflow-hidden focus-within:border-teal-400">
              <input
                type="text"
                maxLength={2}
                value={logTimeObj.hour}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length === 2 && parseInt(val, 10) > 12) val = '12';
                  setLogTimeObj((prev) => ({ ...prev, hour: val }));
                }}
                onBlur={(e) => {
                  let val = e.target.value;
                  if (!val || parseInt(val, 10) === 0) val = '12';
                  else val = String(parseInt(val, 10)).padStart(2, '0');
                  setLogTimeObj((prev) => ({ ...prev, hour: val }));
                }}
                className="w-8 shrink-0 bg-transparent text-center text-white outline-none text-sm"
              />
              <span className="text-white/30 truncate">:</span>
              <input
                type="text"
                maxLength={2}
                value={logTimeObj.minute}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length === 2 && parseInt(val, 10) > 59) val = '59';
                  setLogTimeObj((prev) => ({ ...prev, minute: val }));
                }}
                onBlur={(e) => {
                  let val = e.target.value;
                  if (!val) val = '00';
                  else val = String(parseInt(val, 10)).padStart(2, '0');
                  setLogTimeObj((prev) => ({ ...prev, minute: val }));
                }}
                className="w-8 shrink-0 bg-transparent text-center text-white outline-none text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setLogTimeObj((prev) => ({
                    ...prev,
                    period: prev.period === 'AM' ? 'PM' : 'AM',
                  }))
                }
                className="flex-1 min-w-[34px] px-1 h-full text-xs font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 active:bg-teal-500/30 outline-none transition-colors border-l border-white/5"
              >
                {logTimeObj.period}
              </button>
            </div>
          </div>
        </div>

        {/* Qty & Spent Group */}
        <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="flex-1 md:w-20">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">
              Qty
            </label>
            <input
              type="number"
              placeholder="1"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input w-full py-2"
            />
          </div>
          <div className="flex-1 md:w-24">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">
              Spent ({currencySymbol})
            </label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={moneySpent}
              onChange={(e) => setMoneySpent(e.target.value)}
              className="input w-full py-2"
            />
          </div>
        </div>

        {/* Notes & Submit Group */}
        <div className="w-full md:flex-1 shrink-0">
          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block whitespace-nowrap">
            Notes <span className="lowercase normal-case opacity-60">(opt)</span>
          </label>
          <input
            type="text"
            placeholder="Notes?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input w-full py-2"
          />
        </div>

        <div className="w-full md:w-auto shrink-0 mt-1 md:mt-0">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full md:w-auto whitespace-nowrap justify-center py-2 px-5 h-[42px] min-w-[120px]"
          >
            <Save size={15} /> Add Entry
          </button>
        </div>
      </div>
    </form>
  );
}
