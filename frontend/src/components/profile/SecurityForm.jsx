import { useState } from 'react';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function SecurityForm() {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setPasswordLoading(true);
    try {
      await api.put('/api/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <Lock size={28} className="text-violet-400" />
        <h2 className="font-display font-bold text-3xl text-white">Security</h2>
      </div>

      <form onSubmit={submitPassword} className="glass p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={passwordLoading}
          className="w-full btn-primary bg-violet-600 hover:bg-violet-500 border-violet-500/50 shadow-violet-500/20 justify-center py-2.5"
        >
          {passwordLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock size={16} /> Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}
