const fs = require('fs');
const file = 'c:\\Users\\divya\\Desktop\\JUST ALL\\GitRepo\\PuffOff\\frontend\\src\\pages\\TrackerPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the specific button section - look for the delete button pattern
const searchStr = 'deleteLog(log._id); }} className="ml-auto sm:ml-0 p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-red-500/10" title="Delete entry">';

const idx = content.indexOf(searchStr);
if (idx === -1) {
  console.log('Search string not found');
  // Try to find nearest context
  const idx2 = content.indexOf('title="Delete entry"');
  console.log('title="Delete entry" at:', idx2);
  if (idx2 > 0) {
    console.log('Context:', JSON.stringify(content.substring(idx2-300, idx2+100)));
  }
  process.exit(1);
}

// Find the start of the div wrapping this button  
const divStart = content.lastIndexOf('<div className="flex items-center gap-3', idx);
console.log('div start:', divStart, 'button idx:', idx);

// Find the end </div> after the closing </button>
const buttonEnd = content.indexOf('</button>', idx) + '</button>'.length;
const afterButton = content.indexOf('</div>', buttonEnd);
const segmentEnd = afterButton + '</div>'.length;

console.log('Segment:', JSON.stringify(content.substring(divStart, segmentEnd)));

const newSegment = `<div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
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
                                   </div>`;

content = content.substring(0, divStart) + newSegment + content.substring(segmentEnd);
fs.writeFileSync(file, content, 'utf8');
console.log('SUCCESS');
