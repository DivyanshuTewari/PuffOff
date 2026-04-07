import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit3, X, Save, Tag, ThumbsUp, Smile, Meh, Frown, ThumbsDown } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const MOODS = { great: ThumbsUp, good: Smile, neutral: Meh, bad: Frown, terrible: ThumbsDown };
const MOOD_COLORS = { great: 'text-green-400 bg-green-500/15', good: 'text-teal-400 bg-teal-500/15', neutral: 'text-slate-400 bg-slate-500/15', bad: 'text-amber-400 bg-amber-500/15', terrible: 'text-red-400 bg-red-500/15' };

const empty = { title: '', content: '', mood: 'neutral', tags: '' };

export default function JournalPage() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchJournals = async () => {
    try {
      const r = await api.get('/api/journals');
      setJournals(r.data.journals);
    } catch { toast.error('Failed to load journal'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJournals(); }, []);

  const openNew = () => { setForm(empty); setEditing(null); setShowForm(true); };
  const openEdit = (j) => {
    setForm({ title: j.title, content: j.content, mood: j.mood, tags: (j.tags || []).join(', ') });
    setEditing(j._id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(empty); };

  const onSave = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) {
        await api.put(`/api/journals/${editing}`, payload);
        toast.success('Entry updated');
      } else {
        await api.post('/api/journals', payload);
        toast.success('Entry saved!');
      }
      closeForm();
      fetchJournals();
    } catch { toast.error('Failed to save entry'); }
    finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await api.delete(`/api/journals/${id}`);
      toast.success('Entry deleted');
      fetchJournals();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-blue-400" />
            <div>
              <h1 className="font-display font-bold text-3xl text-white">My Journal</h1>
              <p className="text-slate-400 text-sm">A private space for your thoughts and reflections.</p>
            </div>
          </div>
          <button id="journal-new" onClick={openNew} className="btn-primary">
            <Plus size={16} /> New Entry
          </button>
        </div>

        {/* Form modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-xl text-white">{editing ? 'Edit Entry' : 'New Journal Entry'}</h2>
                  <button onClick={closeForm} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={onSave} className="space-y-4">
                  <input type="text" placeholder="Entry title..." value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="input text-lg font-medium" required />

                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(MOODS).map(([val, IconComponent]) => (
                      <button key={val} type="button" onClick={() => setForm(f => ({ ...f, mood: val }))}
                        className={`px-3 py-1.5 flex flex-row items-center gap-1.5 rounded-lg text-sm border transition-all ${
                          form.mood === val ? 'border-teal-500/40 bg-teal-500/15 text-white' : 'border-white/8 text-slate-400 hover:bg-white/5'
                        }`}>
                        <IconComponent size={15} /> {val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    ))}
                  </div>

                  <textarea placeholder="Write your thoughts freely..." value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={10} className="input resize-none" required />

                  <div className="relative">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Tags: comma, separated (e.g. gratitude, struggle)"
                      value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="input pl-9 text-sm" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Save size={15} /> Save Entry</>}
                    </button>
                    <button type="button" onClick={closeForm} className="btn-outline px-5">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journals list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : journals.length === 0 ? (
          <div className="glass text-center py-20 border border-dashed border-white/10 flex flex-col items-center">
            <BookOpen size={48} className="text-slate-600 mb-4" />
            <h3 className="font-display font-bold text-xl text-white mb-2">No entries yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start writing about your journey. This is your private space.</p>
            <button onClick={openNew} className="btn-primary mx-auto"><Plus size={15} /> Write Your First Entry</button>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((j, i) => (
              <motion.div key={j._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass border border-white/5 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge flex items-center gap-1.5 text-xs ${MOOD_COLORS[j.mood]}`}>
                          {(() => { const Icon = MOODS[j.mood]; return <Icon size={12} /> })()} {j.mood}
                        </span>
                        <span className="text-slate-600 text-xs">{new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-display font-bold text-white text-lg">{j.title}</h3>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(j)} className="p-2 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => onDelete(j._id)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className={`text-slate-400 text-sm leading-relaxed ${expanded === j._id ? '' : 'line-clamp-3'}`}>
                    {j.content}
                  </p>
                  {j.content.length > 200 && (
                    <button onClick={() => setExpanded(expanded === j._id ? null : j._id)}
                      className="text-teal-400 text-xs mt-2 hover:text-teal-300">
                      {expanded === j._id ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {j.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {j.tags.map(t => (
                        <span key={t} className="badge bg-white/5 text-slate-400 border border-white/8 text-xs">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
