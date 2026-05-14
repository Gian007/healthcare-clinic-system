import { useState, useRef } from "react";
import { useAuth } from "../../state/auth";
import * as patientApi from "../../api/patientApi";
import ImageCropper from "../../components/ImageCropper";
import { FaUser, FaKey, FaIdCard, FaCamera, FaCheckCircle, FaTimesCircle, FaCloudUploadAlt, FaExclamationCircle } from "react-icons/fa";

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
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
  
  const frontRef = useRef();
  const backRef  = useRef();
  const selfieRef = useRef();

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
  
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack]   = useState(null);
  const [idSelfie, setIdSelfie] = useState(null);
  
  const [previews, setPreviews] = useState({ front: null, back: null, selfie: null });

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
      if (res.user && fetchUser) await fetchUser();
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

  const [cropImage, setCropImage]   = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropImage(null);
    setLoading(true);
    const fd = new FormData();
    fd.append('photo', croppedBlob, 'profile.jpg');
    try {
      const res = await patientApi.uploadPhoto(fd);
      if (fetchUser) await fetchUser();
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      setError('Failed to upload photo. Max size 2MB.');
    }
    setLoading(false);
  };

  const submitId = async (e) => {
    e.preventDefault();
    if (!idFront || !idBack || !idSelfie) { 
      setError('Please upload all three required photos.'); return; 
    }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('id_front', idFront);
    fd.append('id_back', idBack);
    fd.append('id_selfie', idSelfie);
    try {
      const res = await patientApi.uploadVerificationId(fd);
      if (fetchUser) await fetchUser();
      setSuccess(res.message || 'ID submitted for review!');
      setIdFront(null); setIdBack(null); setIdSelfie(null);
      setPreviews({ front: null, back: null, selfie: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ID.');
    }
    setLoading(false);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'front') { setIdFront(file); setPreviews(p => ({...p, front: URL.createObjectURL(file)})); }
    if (type === 'back') { setIdBack(file); setPreviews(p => ({...p, back: URL.createObjectURL(file)})); }
    if (type === 'selfie') { setIdSelfie(file); setPreviews(p => ({...p, selfie: URL.createObjectURL(file)})); }
  };

  const Field = ({ label, name, type = 'text', state, setState, errors }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input name={name} type={type} value={state[name]} onChange={e => setState(p => ({...p, [name]: e.target.value}))}
        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors?.[name] ? 'border-red-400' : 'border-gray-300 dark:border-slate-700'}`} />
      {errors?.[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const verificationStatus = user?.verification_status || 'Pending';
  const statusConfig = {
    Approved:    { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <FaCheckCircle /> },
    'Under Review': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <FaExclamationCircle /> },
    Rejected:    { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <FaTimesCircle /> },
    Pending:     { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: null },
  }[verificationStatus] || { color: 'bg-gray-100 text-gray-700', icon: null };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {cropImage && <ImageCropper image={cropImage} onCancel={()=>setCropImage(null)} onCropComplete={handleCropComplete} />}
      {success && <SuccessModal message={success} onClose={() => setSuccess('')} />}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <FaExclamationCircle className="shrink-0" />
          {error}
        </div>
      )}

      {/* Profile Picture */}
      <Section icon={<FaCamera />} title="Profile Picture">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl shrink-0 overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
            {user?.profile_picture
              ? <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`} className="w-full h-full object-cover" />
              : <div className="text-primary font-bold">{user?.first_name?.[0] || <FaUser />}</div>}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">Clear face photo (JPG, PNG, max 2MB)</p>
            <input type="file" ref={photoRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            <button onClick={() => photoRef.current?.click()}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-95 transition shadow-md flex items-center gap-2">
              {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <FaCloudUploadAlt />}
              {loading ? 'Processing...' : 'Upload New Photo'}
            </button>
          </div>
        </div>
      </Section>

      {/* Verification Status */}
      <Section icon={<FaIdCard />} title="Identity Verification">
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${statusConfig.color} shadow-sm`}>
            {statusConfig.icon} {verificationStatus}
          </span>
          
          {verificationStatus === 'Rejected' && user?.patient_verification?.rejection_reason && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Reason for Rejection:</p>
              <p className="text-sm text-red-700 dark:text-red-300">{user.patient_verification.rejection_reason}</p>
            </div>
          )}
        </div>

        {(verificationStatus === 'Pending' || verificationStatus === 'Rejected') && (
          <form onSubmit={submitId} className="space-y-8">
            <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/10">
               <h3 className="text-sm font-bold text-primary mb-2">Requirements for Verification</h3>
               <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400 list-disc pl-4">
                 <li>Government issued ID (UMID, Drivers License, Passport, etc.)</li>
                 <li>All images must be clear and readable. No glares or blurs.</li>
                 <li>The ID must be currently valid (not expired).</li>
                 <li>Selfie must clearly show your face holding the ID next to it.</li>
               </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Front ID */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Front of ID</label>
                <input type="file" ref={frontRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'front')} />
                <button type="button" onClick={() => frontRef.current?.click()} 
                  className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition overflow-hidden relative ${previews.front ? 'border-primary' : 'border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  {previews.front ? (
                    <img src={previews.front} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <FaCloudUploadAlt className="text-2xl mx-auto mb-1" />
                      <p className="text-[10px] font-bold">Front Photo</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Back ID */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Back of ID</label>
                <input type="file" ref={backRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'back')} />
                <button type="button" onClick={() => backRef.current?.click()} 
                  className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition overflow-hidden relative ${previews.back ? 'border-primary' : 'border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  {previews.back ? (
                    <img src={previews.back} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <FaCloudUploadAlt className="text-2xl mx-auto mb-1" />
                      <p className="text-[10px] font-bold">Back Photo</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Selfie holding ID */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selfie Holding ID</label>
                <input type="file" ref={selfieRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'selfie')} />
                <button type="button" onClick={() => selfieRef.current?.click()} 
                  className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition overflow-hidden relative ${previews.selfie ? 'border-primary' : 'border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  {previews.selfie ? (
                    <img src={previews.selfie} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <FaCamera className="text-2xl mx-auto mb-1" />
                      <p className="text-[10px] font-bold">Selfie + ID</p>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-gray-400 text-center italic">Make sure the text on your ID is readable in all photos.</p>
              <button type="submit" disabled={loading || !idFront || !idBack || !idSelfie}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:opacity-95 transition disabled:opacity-50 shadow-xl shadow-primary/20">
                {loading ? 'Uploading Documents...' : 'Submit Verification'}
              </button>
            </div>
          </form>
        )}

        {verificationStatus === 'Under Review' && (
          <div className="p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 flex gap-4">
             <div className="text-2xl text-yellow-500 shrink-0 mt-1">🕒</div>
             <div>
               <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Under Review</h3>
               <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 leading-relaxed">
                 Our staff is currently reviewing your documents. This process usually takes 24-48 hours. 
                 You will receive a notification once your account is verified.
               </p>
             </div>
          </div>
        )}

        {verificationStatus === 'Approved' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex gap-4">
             <div className="text-2xl text-emerald-500 shrink-0 mt-1">✅</div>
             <div>
               <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Identity Verified</h3>
               <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                 Your identity has been successfully verified. You now have full access to all clinic services and prioritized booking.
               </p>
             </div>
          </div>
        )}
      </Section>

      {/* Personal Info */}
      <Section icon={<FaUser />} title="Personal Information">
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" name="first_name" state={profile} setState={setProfile} errors={profileErrors} />
            <Field label="Last Name" name="last_name" state={profile} setState={setProfile} errors={profileErrors} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Name Change</label>
              <textarea name="name_change_reason" value={profile.name_change_reason}
                onChange={e => setProfile(p => ({...p, name_change_reason: e.target.value}))}
                placeholder="Enter reason if you are changing your name (e.g., Marriage)"
                rows={1}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" />
              {profileErrors.name_change_reason && <p className="text-xs text-red-500 mt-1">{profileErrors.name_change_reason}</p>}
            </div>
            <Field label="Contact Number" name="contact_number" state={profile} setState={setProfile} errors={profileErrors} />
            <Field label="Email Address" name="email" type="email" state={profile} setState={setProfile} errors={profileErrors} />
            <Field label="Date of Birth" name="birth_date" type="date" state={profile} setState={setProfile} errors={profileErrors} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Address</label>
              <textarea name="address" value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))} rows={2}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-95 transition disabled:opacity-50 shadow-lg shadow-primary/20">
              {loading ? 'Saving...' : 'Save Profile Changes'}
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
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-95 transition disabled:opacity-50 shadow-lg shadow-primary/20">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
