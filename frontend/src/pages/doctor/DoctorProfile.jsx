import { useEffect, useState, useRef } from 'react';
import { User, FileText, Phone, Mail, CalendarDays, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { loadState, saveState } from '../../utils/storage';
import { Button, Card, PageHeader } from '../../components/doctor/DoctorUI';
import { useAuth } from '../../state/auth';
import * as doctorApi from '../../api/doctorApi';
import ImageCropper from '../../components/ImageCropper';

export default function DoctorProfile(){
  const { user, fetchUser } = useAuth();
  const [tab, setTab] = useState('profile'); 
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    specialization_id: user?.specialization_id || '',
    license_number: user?.license_number || '',
    contact_number: user?.contact_number || '',
    email: user?.email || '',
    daily_booking_limit: user?.daily_booking_limit || 20
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        specialization_id: user.specialization_id || '',
        license_number: user.license_number || '',
        contact_number: user.contact_number || '',
        email: user.email || '',
        daily_booking_limit: user.daily_booking_limit || 20
      });
    }
  }, [user]);

  const update = (key, val) => setForm({ ...form, [key]: val });
  
  const handleSave = async () => {
    try {
      setLoading(true);
      await doctorApi.updateProfile(form);
      await fetchUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      alert("Failed to save profile.");
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
      
      <PageHeader title="My Profile" subtitle="Manage your personal information and account settings." />

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">{success}</span>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 w-fit">
        <button onClick={() => setTab('profile')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'profile' ? 'bg-white dark:bg-slate-900 shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}>Profile</button>
        <button onClick={() => setTab('settings')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'settings' ? 'bg-white dark:bg-slate-900 shadow-sm text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}>Settings</button>
      </div>

      {tab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-6">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Input icon={<User />} label="First Name" value={form.first_name} onChange={v => update('first_name', v)} />
                <Input icon={<User />} label="Last Name" value={form.last_name} onChange={v => update('last_name', v)} />
                <Input icon={<FileText />} label="License Number" value={form.license_number} onChange={v => update('license_number', v)} />
                <Input icon={<Phone />} label="Contact Number" value={form.contact_number} onChange={v => update('contact_number', v)} />
                <Input icon={<Mail />} label="Email Address" value={form.email} onChange={v => update('email', v)} />
                <Input icon={<CalendarDays />} label="Daily Booking Limit" value={form.daily_booking_limit} onChange={v => update('daily_booking_limit', v)} />
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline">Reset Changes</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl bg-slate-100 flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                  ) : (
                    <img src={pfp} className="w-full h-full object-cover" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-teal-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-slate-900"
                >
                  <Camera size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
              </div>
              <h3 className="font-bold text-xl">{user?.first_name} {user?.last_name}</h3>
              <p className="text-teal-600 font-medium text-sm mb-6">{user?.specialization?.specialization_name || 'Medical Doctor'}</p>
              
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Doctor ID</p>
                  <p className="text-sm font-bold">{user?.doctor_id || 'DOC-DEFAULT'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-lg font-bold mb-6">Account Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive appointment updates via email</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-teal-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch application theme</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-teal-600" />
            </label>
          </div>
        </Card>
      )}
    </div>
  );
}

function Input({ label, value, onChange, icon }) {
  return (
    <label className="block">
      <p className="font-bold text-xs text-slate-500 uppercase mb-2 tracking-wide">{label}</p>
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
        <span className="text-slate-400">{icon}</span>
        <input 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-transparent py-3 outline-none text-sm font-medium"
        />
      </div>
    </label>
  );
}
