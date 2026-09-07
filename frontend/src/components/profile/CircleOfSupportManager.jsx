import { Heart, Plus, Trash2 } from 'lucide-react';

export default function CircleOfSupportManager({
  contacts = [],
  onAddContact,
  onRemoveContact,
  onUpdateContact,
}) {
  return (
    <div className="pt-4 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-pink-400" />
          <h3 className="font-semibold text-white">Circle of Support</h3>
        </div>
        <button
          type="button"
          onClick={onAddContact}
          className="text-xs flex items-center gap-1 text-teal-400 hover:text-teal-300"
        >
          <Plus size={14} /> Add Supporter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {contacts.map((contact, idx) => (
          <div key={idx} className="glass p-4 rounded-xl border-white/5 relative group">
            <button
              type="button"
              onClick={() => onRemoveContact(idx)}
              className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                placeholder="Name"
                value={contact.name}
                onChange={(e) => onUpdateContact(idx, 'name', e.target.value)}
                className="input text-xs py-1.5"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={contact.phone}
                onChange={(e) => onUpdateContact(idx, 'phone', e.target.value)}
                className="input text-xs py-1.5"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Relationship"
                value={contact.relationship}
                onChange={(e) => onUpdateContact(idx, 'relationship', e.target.value)}
                className="input text-xs py-1.5"
                required
              />
              <select
                value={contact.supportType}
                onChange={(e) => onUpdateContact(idx, 'supportType', e.target.value)}
                className="input text-xs py-1.5 bg-slate-900"
              >
                <option className="bg-slate-900" value="Emotional Support">
                  Emotional Support
                </option>
                <option className="bg-slate-900" value="Crisis Help">
                  Crisis Help
                </option>
                <option className="bg-slate-900" value="Daily Motivation">
                  Daily Motivation
                </option>
                <option className="bg-slate-900" value="Professional">
                  Professional Support
                </option>
              </select>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-2">
            No supporters added. Add people who can help when it's hard.
          </p>
        )}
      </div>
    </div>
  );
}
