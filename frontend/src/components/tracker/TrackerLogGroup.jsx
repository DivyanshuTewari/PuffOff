import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export default function TrackerLogGroup({
  groupedLogs,
  currentAddiction,
  onDeleteLog,
  currency = 'INR',
}) {
  const [expandedDays, setExpandedDays] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const toggleExpand = (day) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const currencySymbol = getCurrencySymbol(currency);

  if (groupedLogs.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 italic">
        No entries yet. Start logging your usage!
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
      {groupedLogs.map((group) => {
        const isExpanded = expandedDays[group.dateStr];
        return (
          <div
            key={group.dateStr}
            className="glass rounded-xl border border-white/5 overflow-hidden transition-all"
          >
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
                  <span className="font-medium text-red-400">
                    -{currencySymbol}{group.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Entries expanded */}
            {isExpanded && (
              <div className="bg-slate-900/40 border-t border-white/5 divide-y divide-white/5">
                {group.entries.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 pl-12 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs text-slate-300 font-medium">
                        {new Date(log.date).toLocaleTimeString([], { timeStyle: 'short' })}
                      </span>
                      {log.notes && (
                        <span className="text-sm text-slate-400 mt-0.5 truncate" title={log.notes}>
                          {log.notes}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                      <span className="text-sm font-medium text-white/80">{log.quantity} units</span>
                      <span className="text-sm font-medium text-red-400/80">
                        -{currencySymbol}{log.moneySpent.toFixed(2)}
                      </span>
                      {confirmDeleteId === log._id ? (
                        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLog(log._id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(log._id);
                          }}
                          className="ml-auto sm:ml-0 p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-red-500/10"
                          title="Delete entry"
                        >
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
      })}
    </div>
  );
}
