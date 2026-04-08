import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Camera, Calendar, FileText, Phone, Heart, ShieldAlert, Trash2, Plus } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    username: '',
    profileImage: '',
    dob: '',
    bio: '',
    emergencyContacts: [],
    currency: 'INR', // default currency
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        profileImage: user.profileImage || '',
        dob: user.dob ? user.dob.substring(0, 10) : '',
        bio: user.bio || '',
        emergencyContacts: user.emergencyContacts || [],
        currency: user.currency || 'INR',
      });
    }
  }, [user]);

  const addContact = () => {
    setProfileForm({
      ...profileForm,
      emergencyContacts: [...profileForm.emergencyContacts, { name: '', phone: '', relationship: '', supportType: 'Emotional Support' }]
    });
  };

  const removeContact = (index) => {
    const updated = [...profileForm.emergencyContacts];
    updated.splice(index, 1);
    setProfileForm({ ...profileForm, emergencyContacts: updated });
  };

  const updateContact = (index, field, value) => {
    const updated = [...profileForm.emergencyContacts];
    updated[index][field] = value;
    setProfileForm({ ...profileForm, emergencyContacts: updated });
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB for browser performance)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("File is too large (Max 2MB)");
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setProfileForm({ ...profileForm, profileImage: reader.result });
      setUploadingImage(false);
      toast.success("Image preview updated! Click 'Save Profile' to lock it in.");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setUploadingImage(false);
    };
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/api/auth/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
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
    <div className="page max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Profile Section */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <User size={28} className="text-teal-400" />
              <h1 className="font-display font-bold text-3xl text-white">My Profile</h1>
            </div>

            <form onSubmit={submitProfile} className="glass p-6 space-y-6">
              
              {/* Profile Image Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
                    {profileForm.profileImage ? (
                      <img src={profileForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-3xl text-teal-400">
                        {profileForm.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Profile Image</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 transition-all focus:outline-none disabled:opacity-50" />
                  </div>
                  {uploadingImage ? (
                    <p className="text-xs text-teal-400 animate-pulse">Reading file...</p>
                  ) : (
                    <p className="text-xs text-slate-500">Pick an image to update your profile picture.</p>
                  )}
                </div>
              </div>

              {/* Currency Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Currency</label>
                  <select name="currency" value={profileForm.currency} onChange={handleProfileChange} className="input">
                    {['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => (
                      <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>
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
                    <input type="text" name="username" value={profileForm.username} onChange={handleProfileChange}
                      required minLength={3} className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-slate-500" />
                    </div>
                    <input type="date" name="dob" value={profileForm.dob} onChange={handleProfileChange} className="input pl-10" />
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
                  <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={2}
                    placeholder="Tell us a little about your goals or why you're quitting..."
                    className="input pl-10 resize-none"></textarea>
                </div>
              </div>

              {/* Circle of Support */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart size={18} className="text-pink-400" />
                    <h3 className="font-semibold text-white">Circle of Support</h3>
                  </div>
                  <button type="button" onClick={addContact} className="text-xs flex items-center gap-1 text-teal-400 hover:text-teal-300">
                    <Plus size={14} /> Add Supporter
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {profileForm.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="glass p-4 rounded-xl border-white/5 relative group">
                      <button type="button" onClick={() => removeContact(idx)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input type="text" placeholder="Name" value={contact.name} onChange={(e) => updateContact(idx, 'name', e.target.value)} className="input text-xs py-1.5" required />
                        <input type="text" placeholder="Phone" value={contact.phone} onChange={(e) => updateContact(idx, 'phone', e.target.value)} className="input text-xs py-1.5" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Relationship" value={contact.relationship} onChange={(e) => updateContact(idx, 'relationship', e.target.value)} className="input text-xs py-1.5" required />
                        <select value={contact.supportType} onChange={(e) => updateContact(idx, 'supportType', e.target.value)} className="input text-xs py-1.5 bg-slate-900">
                          <option className="bg-slate-900" value="Emotional Support">Emotional Support</option>
                          <option className="bg-slate-900" value="Crisis Help">Crisis Help</option>
                          <option className="bg-slate-900" value="Daily Motivation">Daily Motivation</option>
                          <option className="bg-slate-900" value="Professional">Professional Support</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {profileForm.emergencyContacts.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-2">No supporters added. Add people who can help when it's hard.</p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={profileLoading} className="btn-primary w-full justify-center py-2.5">
                {profileLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Profile</>}
              </button>
            </form>
          </div>

          {/* Security Section */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <Lock size={28} className="text-violet-400" />
              <h2 className="font-display font-bold text-3xl text-white">Security</h2>
            </div>
            
            <form onSubmit={submitPassword} className="glass p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange}
                  required className="input" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange}
                  required minLength={6} className="input" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                  required minLength={6} className="input" placeholder="••••••••" />
              </div>

              <button type="submit" disabled={passwordLoading} className="w-full btn-primary bg-violet-600 hover:bg-violet-500 border-violet-500/50 shadow-violet-500/20 justify-center py-2.5">
                {passwordLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={16} /> Update Password</>}
              </button>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
