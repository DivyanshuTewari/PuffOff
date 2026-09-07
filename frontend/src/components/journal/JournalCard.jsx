import { motion } from 'framer-motion';
import { Edit3, Trash2 } from 'lucide-react';
import { JOURNAL_MOODS, JOURNAL_MOOD_COLORS } from './JournalFormModal';

export default function JournalCard({
  journal,
  index,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) {
  const IconComponent = JOURNAL_MOODS[journal.mood] || JOURNAL_MOODS.neutral;
  const moodColor = JOURNAL_MOOD_COLORS[journal.mood] || JOURNAL_MOOD_COLORS.neutral;
  const isExpanded = expanded === journal._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass border border-white/5 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge flex items-center gap-1.5 text-xs ${moodColor}`}>
                <IconComponent size={12} /> {journal.mood}
              </span>
              <span className="text-slate-600 text-xs">
                {new Date(journal.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h3 className="font-display font-bold text-white text-lg">{journal.title}</h3>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(journal)}
              className="p-2 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all"
              title="Edit Entry"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(journal._id)}
              className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
              title="Delete Entry"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <p className={`text-slate-400 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {journal.content}
        </p>

        {journal.content.length > 200 && (
          <button
            onClick={() => onToggleExpand(journal._id)}
            className="text-teal-400 text-xs mt-2 hover:text-teal-300"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {journal.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {journal.tags.map((t) => (
              <span key={t} className="badge bg-white/5 text-slate-400 border border-white/8 text-xs">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
