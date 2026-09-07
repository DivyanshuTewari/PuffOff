import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

import { updateUserProfile } from '../store/slices/authSlice';

import ProfileImageUpload from '../components/profile/ProfileImageUpload';
import ProfileInfoForm from '../components/profile/ProfileInfoForm';
import CircleOfSupportManager from '../components/profile/CircleOfSupportManager';
import SecurityForm from '../components/profile/SecurityForm';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    username: '',
    profileImage: '',
    dob: '',
    bio: '',
    emergencyContacts: [],
    currency: 'INR',
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
    setProfileForm((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', phone: '', relationship: '', supportType: 'Emotional Support' },
      ],
    }));
  };

  const removeContact = (index) => {
    const updated = [...profileForm.emergencyContacts];
    updated.splice(index, 1);
    setProfileForm({ ...profileForm, emergencyContacts: updated });
  };

  const updateContact = (index, field, value) => {
    const updated = [...profileForm.emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setProfileForm({ ...profileForm, emergencyContacts: updated });
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (base64Image) => {
    setProfileForm((prev) => ({ ...prev, profileImage: base64Image }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await dispatch(updateUserProfile(profileForm)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update profile');
    } finally {
      setProfileLoading(false);
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
              <ProfileImageUpload
                profileImage={profileForm.profileImage}
                username={profileForm.username}
                uploadingImage={uploadingImage}
                setUploadingImage={setUploadingImage}
                onImageChange={handleImageChange}
              />

              <ProfileInfoForm form={profileForm} onChange={handleProfileChange} />

              <CircleOfSupportManager
                contacts={profileForm.emergencyContacts}
                onAddContact={addContact}
                onRemoveContact={removeContact}
                onUpdateContact={updateContact}
              />

              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {profileLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} /> Save Profile
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Section */}
          <SecurityForm />
        </div>
      </motion.div>
    </div>
  );
}
