import { useEffect, useState, useRef } from 'react';
import { User, FileText, Phone, Mail, Camera, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { Button, Card, PageHeader } from '../../components/doctor/DoctorUI';
import { useAuth } from '../../state/auth';
import * as doctorApi from '../../api/doctorApi';
import ImageCropper from '../../components/ImageCropper';

export default function DoctorProfile(){
  const { user, fetchUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    license_number: '',
    contact_number: '',
    email: '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        license_number: user.license_number || '',
        contact_number: user.contact_number || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const update = (key, val) => setForm({ ...form, [key]: val });
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setErrors({});
      await doctorApi.updateProfile(form);
      await fetchUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors(error.response?.data?.errors || { general: 'Failed to save profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match." });
      return;
    }
    try {
      setPasswordLoading(true);
      setErrors({});
      await doctorApi.updatePassword(passwords);
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors(error.response?.data?.errors || { password_general: error.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
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
    fd.append('photo', blob, 'profile.jpg');
    try {
      await doctorApi.uploadPhoto(fd);
      await fetchUser();
      setSuccess('Profile photo updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const pfp = user?.profile_picture 
    ? `${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}` 
    : `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`;

  return (
    <div className="max-w-5xl mx-auto">
      {cropImage && <ImageCropper image={cropImage} onCancel={() => setCropImage(null)} onCropComplete={handleCropComplete} />}
      
      <PageHeader title="Account Settings" subtitle="Manage your doctor profile, email, and security." />

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 animate-duration-300">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Personal Information</h2>
            {errors.general && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{errors.general}</div>}
            
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Input label="First Name" value={form.first_name} onChange={v => update('first_name', v)} />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <Input label="Last Name" value={form.last_name} onChange={v => update('last_name', v)} />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <Input label="License Number" value={form.license_number} onChange={v => update('license_number', v)} />
                {errors.license_number && <p className="text-xs text-red-500 mt-1">{errors.license_number}</p>}
              </div>
              <div>
                <Input label="Contact Number" value={form.contact_number} onChange={v => update('contact_number', v)} />
                {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
              </div>
              <div className="md:col-span-2">
                <Input label="Email Address" value={form.email} onChange={v => update('email', v)} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Change Password</h2>
            {errors.password_general && <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{errors.password_general}</div>}
            
            <div className="space-y-5 max-w-md">
              <div>
                <Input type="password" label="Current Password" value={passwords.current_password} onChange={v => setPasswords(p => ({ ...p, current_password: v }))} />
                {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
              </div>
              <div>
                <Input type="password" label="New Password" value={passwords.password} onChange={v => setPasswords(p => ({ ...p, password: v }))} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <Input type="password" label="Confirm New Password" value={passwords.password_confirmation} onChange={v => setPasswords(p => ({ ...p, password_confirmation: v }))} />
                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
            
            <div className="mt-8">
              <Button onClick={handlePasswordSave} disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="animate-spin mr-2" size={16} />}
                Update Password
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Card */}
        <div>
          <Card className="p-6 text-center">
            <div className="relative mx-auto w-32 h-32 mb-4 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl bg-slate-100 flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="animate-spin text-teal-600" size={32} />
                ) : (
                  <img src={pfp} className="w-full h-full object-cover animate-in fade-in" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-teal-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-slate-900 animate-in zoom-in"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
            </div>
            
            <h3 className="font-bold text-xl">{user?.first_name} {user?.last_name}</h3>
            <p className="text-teal-600 font-semibold text-sm mb-6 uppercase tracking-wider">{user?.specialization?.specialization_name || 'Medical Doctor'}</p>
            
            <div className="space-y-3 text-left">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Doctor ID</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.doctor_id || 'DOC-DEFAULT'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Email Address</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{user?.email}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Number</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.contact_number || '—'}</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <p className="font-bold text-xs text-slate-500 uppercase mb-2 tracking-wide">{label}</p>
      <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
        <input 
          type={type}
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-transparent py-3 outline-none text-sm font-medium text-slate-900 dark:text-white"
        />
      </div>
    </label>
  );
}
