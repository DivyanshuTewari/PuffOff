import toast from 'react-hot-toast';

export default function ProfileImageUpload({
  profileImage,
  username,
  uploadingImage,
  setUploadingImage,
  onImageChange,
}) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File is too large (Max 2MB)');
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      onImageChange(reader.result);
      setUploadingImage(false);
      toast.success("Image preview updated! Click 'Save Profile' to lock it in.");
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadingImage(false);
    };
  };

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
      <div className="relative group shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-3xl text-teal-400">
              {username?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 w-full space-y-2">
        <label className="block text-sm font-medium text-slate-300">Profile Image</label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20 transition-all focus:outline-none disabled:opacity-50"
          />
        </div>
        {uploadingImage ? (
          <p className="text-xs text-teal-400 animate-pulse">Reading file...</p>
        ) : (
          <p className="text-xs text-slate-500">Pick an image to update your profile picture.</p>
        )}
      </div>
    </div>
  );
}
