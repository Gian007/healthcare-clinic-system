import { useState, useRef } from "react";
import { useAuth } from "../../state/auth";
import * as patientApi from "../../api/patientApi";
import { FaUser, FaKey, FaIdCard, FaCamera, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function SuccessModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        <button onClick={onClose} className="mt-6 w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition">
          OK
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-800">
        <span className="text-primary text-lg">{icon}</span>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function PatientProfile() {
  const { user, login, fetchUser } = useAuth();
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const photoRef                  = useRef();
  const idRef                     = useRef();

  const [profile, setProfile] = useState({
    first_name:          user?.first_name || '',
    last_name:           user?.last_name  || '',
    contact_number:      user?.contact_number || '',
    email:               user?.email || '',
    birth_date:          user?.birth_date || '',
    address:             user?.address || '',
    name_change_reason:  '',
  });
  const [passwords, setPasswords] = useState({ current_password:'', password:'', password_confirmation:'' });
  const [profileErrors, setProfileErrors] = useState({});
  const [pwErrors, setPwErrors]           = useState({});
  const [idFile, setIdFile]               = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: name === 'contact_number' ? value.replace(/\D/g, '') : value }));
    setProfileErrors(p => ({ ...p, [name]: '' }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setProfileErrors({});
    try {
      const res = await patientApi.updateProfile(profile);
      setSuccess(res.message || 'Profile updated successfully!');
      if (res.user && fetchUser) {
        await fetchUser();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setProfileErrors(e);
      } else {
        setError(err.response?.data?.message || 'Failed to update profile.');
      }
    }
    setLoading(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setPwErrors({ password_confirmation: 'Passwords do not match.' }); return;
    }
    setLoading(true); setError(''); setPwErrors({});
    try {
      const res = await patientApi.updatePassword(passwords);
      setSuccess(res.message || 'Password updated!');
      setPasswords({ current_password:'', password:'', password_confirmation:'' });
    } catch (err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setPwErrors(e);
      } else {
        setError(err.response?.data?.message || 'Failed to update password.');
      }
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await patientApi.uploadPhoto(fd);
      if (fetchUser) await fetchUser();
      setSuccess('Profile picture updated!');
    } catch {
      setError('Failed to upload photo. Max size 2MB.');
    }
    setLoading(false);
  };

  const submitId = async (e) => {
    e.preventDefault();
    if (!idFile) { setError('Please select an ID image.'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('id_image', idFile);
    try {
      const res = await patientApi.uploadVerificationId(fd);
      if (fetchUser) await fetchUser();
      setSuccess(res.message || 'ID submitted for review!');
      setIdFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ID.');
    }
    setLoading(false);
  };

  const Field = ({ label, name, type = 'text', state, setState, errors, half }) => (
    <div className={half ? '' : ''}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input name={name} type={type} value={state[name]} onChange={e => setState(p => ({...p, [name]: e.target.value}))}
        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors?.[name] ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
      {errors?.[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const verificationStatus = user?.verification_status || 'Pending';
  const statusConfig = {
    Approved:    { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <FaCheckCircle /> },
    'Under Review': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: null },
    Rejected:    { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <FaTimesCircle /> },
    Pending:     { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: null },
  }[verificationStatus] || { color: 'bg-gray-100 text-gray-700', icon: null };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {success && <SuccessModal message={success} onClose={() => setSuccess('')} />}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Profile Picture */}
      <Section icon={<FaCamera />} title="Profile Picture">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl shrink-0 overflow-hidden">
            {user?.profile_picture
              ? <img src={`http://localhost:8000/storage/${user.profile_picture}`} alt="avatar" className="w-full h-full object-cover" />
              : <FaUser />}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">JPG, PNG, max 2MB</p>
            <input type="file" ref={photoRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            <button onClick={() => photoRef.current?.click()}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              {loading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
        </div>
      </Section>

      {/* Verification Status */}
      <Section icon={<FaIdCard />} title="ID Verification">
        <div className="flex items-center gap-3 mb-4">
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.icon} {verificationStatus}
          </span>
        </div>

        {(verificationStatus === 'Pending' || verificationStatus === 'Rejected') && (
          <form onSubmit={submitId} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {verificationStatus === 'Rejected'
                ? 'Your ID was rejected. Please upload a new valid government ID.'
                : 'Upload a valid government ID to verify your account and unlock full booking access.'}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Image (Government ID, max 5MB)</label>
              <input type="file" ref={idRef} accept="image/*" onChange={e => setIdFile(e.target.files[0])} className="hidden" />
              <button type="button" onClick={() => idRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition">
                {idFile ? (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <FaCheckCircle /> <span className="text-sm font-medium">{idFile.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">
                    <FaIdCard className="text-3xl mx-auto mb-2" />
                    <p className="text-sm">Click to select your ID image</p>
                  </div>
                )}
              </button>
            </div>
            <button type="submit" disabled={loading || !idFile}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit ID for Review'}
            </button>
          </form>
        )}

        {verificationStatus === 'Under Review' && (
          <p className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            Your ID is currently being reviewed. This usually takes 1–2 business days. You can still book appointments while waiting.
          </p>
        )}

        {verificationStatus === 'Approved' && (
          <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            ✅ Your identity has been verified. You have full access to all booking features.
          </p>
        )}
      </Section>

      {/* Personal Info */}
      <Section icon={<FaUser />} title="Personal Information">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" name="first_name" state={profile} setState={setProfile} errors={profileErrors} />
            <Field label="Last Name" name="last_name" state={profile} setState={setProfile} errors={profileErrors} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Name Change</label>
              <input name="name_change_reason" value={profile.name_change_reason}
                onChange={e => setProfile(p => ({...p, name_change_reason: e.target.value}))}
                placeholder="Required if changing name"
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" />
              {profileErrors.name_change_reason && <p className="text-xs text-red-500 mt-1">{profileErrors.name_change_reason}</p>}
            </div>
            <Field label="Contact Number" name="contact_number" state={profile} setState={(fn) => { setProfile(p => { const up = fn(p); return { ...up, contact_number: up.contact_number.replace(/\D/g,'') }; }); }} errors={profileErrors} />
            <Field label="Email" name="email" type="email" state={profile} setState={setProfile} errors={profileErrors} />
            <Field label="Birth Date" name="birth_date" type="date" state={profile} setState={setProfile} errors={profileErrors} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea name="address" value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))} rows={2}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* Change Password */}
      <Section icon={<FaKey />} title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          {[
            ['Current Password', 'current_password'],
            ['New Password',     'password'],
            ['Confirm New Password', 'password_confirmation'],
          ].map(([label, name]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type="password" name={name} value={passwords[name]}
                onChange={e => setPasswords(p => ({...p, [name]: e.target.value}))}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${pwErrors[name] ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
              {pwErrors[name] && <p className="text-xs text-red-500 mt-1">{pwErrors[name]}</p>}
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
