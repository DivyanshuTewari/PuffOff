import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Tag, ThumbsUp, Smile, Meh, Frown, ThumbsDown } from 'lucide-react';

export const JOURNAL_MOODS = {
  great: ThumbsUp,
  good: Smile,
  neutral: Meh,
  bad: Frown,
  terrible: ThumbsDown,
};

export const JOURNAL_MOOD_COLORS = {
  great: 'text-green-400 bg-green-500/15',
  good: 'text-teal-400 bg-teal-500/15',
  neutral: 'text-slate-400 bg-slate-500/15',
  bad: 'text-amber-400 bg-amber-500/15',
  terrible: 'text-red-400 bg-red-500/15',
};

export default function JournalFormModal({
  show,
  editing,
  form,
  setForm,
  onSave,
  onClose,
  saving,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-white">
                {editing ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={onSave} className="space-y-4">
              <input
                type="text"
                placeholder="Entry title..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input text-lg font-medium"
                required
              />

              <div className="flex gap-2 flex-wrap">
                {Object.entries(JOURNAL_MOODS).map(([val, IconComponent]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mood: val }))}
                    className={`px-3 py-1.5 flex flex-row items-center gap-1.5 rounded-lg text-sm border transition-all ${
                      form.mood === val
                        ? 'border-teal-500/40 bg-teal-500/15 text-white'
                        : 'border-white/8 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <IconComponent size={15} /> {val.charAt(0).toUpperCase() + val.slice(1)}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write your thoughts freely..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10}
                className="input resize-none"
                required
              />

              <div className="relative">
                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tags: comma, separated (e.g. gratitude, struggle)"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="input pl-9 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 justify-center py-3"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={15} /> Save Entry
                    </>
                  )}
                </button>
                <button type="button" onClick={onClose} className="btn-outline px-5">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
