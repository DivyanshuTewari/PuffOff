import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  fetchJournals,
  addJournal,
  updateJournal,
  deleteJournal,
} from '../store/slices/journalsSlice';

import JournalFormModal from '../components/journal/JournalFormModal';
import JournalCard from '../components/journal/JournalCard';

const empty = { title: '', content: '', mood: 'neutral', tags: '' };

export default function JournalPage() {
  const dispatch = useDispatch();
  const { items: journals, loading, submitting } = useSelector((state) => state.journals);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    dispatch(fetchJournals());
  }, [dispatch]);

  const openNew = () => {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (j) => {
    setForm({
      title: j.title,
      content: j.content,
      mood: j.mood,
      tags: (j.tags || []).join(', '),
    });
    setEditing(j._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error('Title and content are required');
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      tags: form.tags
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (editing) {
        await dispatch(updateJournal({ id: editing, data: payload })).unwrap();
        toast.success('Entry updated');
      } else {
        await dispatch(addJournal(payload)).unwrap();
        toast.success('Entry saved!');
      }
      closeForm();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save entry');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await dispatch(deleteJournal(id)).unwrap();
      toast.success('Entry deleted');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete');
    }
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

        {/* Modal */}
        <JournalFormModal
          show={showForm}
          editing={editing}
          form={form}
          setForm={setForm}
          onSave={onSave}
          onClose={closeForm}
          saving={submitting}
        />

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
            <button onClick={openNew} className="btn-primary mx-auto">
              <Plus size={15} /> Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((j, i) => (
              <JournalCard
                key={j._id}
                journal={j}
                index={i}
                expanded={expanded}
                onToggleExpand={(id) => setExpanded((prev) => (prev === id ? null : id))}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
