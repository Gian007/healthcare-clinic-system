import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../state/auth";
import * as staffApi from "../../api/staffApi";
import ImageCropper from "../../components/ImageCropper";
import { FaUser, FaCamera, FaKey, FaEnvelope, FaPhone, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function StaffProfile() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', middle_name: '', email: '', contact_number: ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '', password: '', password_confirmation: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffApi.updateProfile(profile);
      await fetchUser();
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await staffApi.updatePassword(passwords);
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleCropComplete = async (blob) => {
    setCropImage(null);
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', blob, 'staff_profile.jpg');
    try {
      await staffApi.uploadPhoto(fd);
      await fetchUser();
      setSuccess("Profile photo updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const pfp = user?.profile_picture 
    ? `${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}` 
    : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {cropImage && <ImageCropper image={cropImage} onCancel={() => setCropImage(null)} onCropComplete={handleCropComplete} />}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        {success && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 animate-in fade-in slide-in-from-right-4">
            <FaCheckCircle /> {success}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Photo Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center shadow-sm">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden bg-teal-50 dark:bg-gray-800 border-4 border-white dark:border-gray-950 shadow-xl flex items-center justify-center">
                {uploading ? <FaSpinner className="animate-spin text-teal-600" /> : <img src={pfp} className="w-full h-full object-cover" />}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-teal-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-gray-950"
              >
                <FaCamera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</h3>
            <p className="text-teal-600 font-bold text-xs uppercase tracking-widest mt-1">Staff Member</p>
          </div>
        </div>

        {/* Forms */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleProfileSave} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FaUser className="text-teal-600" />
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={profile.first_name} onChange={v => setProfile({...profile, first_name: v})} />
              <Input label="Last Name" value={profile.last_name} onChange={v => setProfile({...profile, last_name: v})} />
              <Input label="Email Address" icon={<FaEnvelope />} value={profile.email} onChange={v => setProfile({...profile, email: v})} />
              <Input label="Contact Number" icon={<FaPhone />} value={profile.contact_number} onChange={v => setProfile({...profile, contact_number: v})} />
            </div>
            <div className="mt-8">
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 disabled:opacity-50">
                {loading ? 'Saving...' : 'Update Personal Info'}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSave} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FaKey className="text-teal-600" />
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Security & Password</h2>
            </div>
            <div className="space-y-4">
              <Input label="Current Password" type="password" value={passwords.current_password} onChange={v => setPasswords({...passwords, current_password: v})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="New Password" type="password" value={passwords.password} onChange={v => setPasswords({...passwords, password: v})} />
                <Input label="Confirm New Password" type="password" value={passwords.password_confirmation} onChange={v => setPasswords({...passwords, password_confirmation: v})} />
              </div>
            </div>
            <div className="mt-8">
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-bold hover:opacity-90 transition disabled:opacity-50">
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, icon, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">{icon}</span>}
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-11' : 'px-4'} py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all`}
        />
      </div>
    </div>
  );
}
