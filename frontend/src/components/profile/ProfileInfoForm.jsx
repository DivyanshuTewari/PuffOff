import { User, Calendar, FileText } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

export default function ProfileInfoForm({ form, onChange }) {
  return (
    <>
      {/* Currency Preference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Currency</label>
          <select name="currency" value={form.currency} onChange={onChange} className="input">
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-slate-800 text-white">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Basic Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-slate-500" />
            </div>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              required
              minLength={3}
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-slate-500" />
            </div>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={onChange}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Bio / My Journey</label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText size={16} className="text-slate-500" />
          </div>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={2}
            placeholder="Tell us a little about your goals or why you're quitting..."
            className="input pl-10 resize-none"
          />
        </div>
      </div>
    </>
  );
}
