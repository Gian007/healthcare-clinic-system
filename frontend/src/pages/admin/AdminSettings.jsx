import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../state/auth";
import { PageHeader, TextInput } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import ImageCropper from "../../components/ImageCropper";
import { FaCamera, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function AdminSettings() {
  const { user, fetchUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', email: '', contact_number: ''
  });
  const [passwords, setPasswords] = useState({
    current_password: '', password: '', password_confirmation: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
      });
    }
  }, [user]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true); setErrors({});
    try {
      await adminApi.updateProfile(profile);
      await fetchUser();
      showSuccess("Profile updated successfully!");
    } catch (err) {
      setErrors(err.response?.data?.errors || { profile: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match." });
      return;
    }
    setSavingPassword(true); setErrors({});
    try {
      await adminApi.updatePassword(passwords);
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
      showSuccess("Password changed successfully!");
    } catch (err) {
      setErrors(err.response?.data?.errors || { password_general: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropImage(null);
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', croppedBlob, 'profile.jpg');
    try {
      await adminApi.uploadPhoto(fd);
      await fetchUser();
      showSuccess("Profile picture updated!");
    } catch (err) {
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const photoUrl = user?.profile_picture 
    ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`)
    : null;

  return (
    <div>
      {cropImage && <ImageCropper image={cropImage} onCancel={()=>setCropImage(null)} onCropComplete={handleCropComplete} />}
      <PageHeader title="Account Settings" subtitle="Manage your admin profile, email, and security." />

      {successMsg && (
        <div className="mb-6 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-4 flex items-center gap-3 shadow-sm border border-emerald-200 dark:border-emerald-800">
          <FaCheckCircle className="text-xl" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Profile Details */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleProfileSave} className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-lg mb-5 text-gray-900 dark:text-white">Personal Information</h2>
            {errors.profile && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.profile}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <TextInput label="First Name" value={profile.first_name} onChange={v => setProfile(p => ({...p, first_name: v}))} />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <TextInput label="Last Name" value={profile.last_name} onChange={v => setProfile(p => ({...p, last_name: v}))} />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <TextInput label="Email Address" type="email" value={profile.email} onChange={v => setProfile(p => ({...p, email: v}))} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <TextInput label="Contact Number" value={profile.contact_number} onChange={v => setProfile(p => ({...p, contact_number: v}))} />
                {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={savingProfile} className="bg-primary hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold transition disabled:opacity-50">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSave} className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-lg mb-5 text-gray-900 dark:text-white">Change Password</h2>
            {errors.password_general && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors.password_general}</div>}
            
            <div className="space-y-4 max-w-md">
              <div>
                <TextInput label="Current Password" type="password" value={passwords.current_password} onChange={v => setPasswords(p => ({...p, current_password: v}))} />
                {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
              </div>
              <div>
                <TextInput label="New Password" type="password" value={passwords.password} onChange={v => setPasswords(p => ({...p, password: v}))} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <TextInput label="Confirm New Password" type="password" value={passwords.password_confirmation} onChange={v => setPasswords(p => ({...p, password_confirmation: v}))} />
                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
            
            <div className="mt-6">
              <button type="submit" disabled={savingPassword} className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-semibold transition disabled:opacity-50">
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Profile Card & Photo */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
          <div className="relative mx-auto w-32 h-32 mb-4 group">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-4xl font-bold text-teal-600">
              {uploading ? (
                <FaSpinner className="animate-spin text-gray-400" />
              ) : photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.first_name?.[0] || 'A'
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-transform">
              <FaCamera />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
          
          <h2 className="text-center font-bold text-xl text-slate-900 dark:text-white">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-center text-sm text-primary font-medium mt-1">System Administrator</p>

          <div className="mt-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-200">{user?.email}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-gray-500 mb-1">Contact Number</p>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-200">{user?.contact_number || '—'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
