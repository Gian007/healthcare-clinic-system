import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../state/auth";
import { useAdminSettings } from "../state/adminSettings";
import { resolveLogoUrl } from "../config/adminSettings";
import * as authApi from "../api/authApi";
import Logo from "../components/Logo";

const Field = ({ label, name, type = 'text', required, className = '', value, onChange, errors, autoCapitalize, autoComplete, spellCheck }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <input
      name={name} type={type} required={required}
      value={value} onChange={onChange}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors[name] ? 'border-red-400' : 'border-gray-300'}`}
    />
    {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
  </div>
);

export default function Register() {
  const { settings } = useAdminSettings();
  const logoUrl = resolveLogoUrl(settings.branding.logoPath);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', middle_name: '',
    birth_date: '', sex: 'Male', contact_number: '',
    email: '', password: '', password_confirmation: '',
    address: '', otp_code: '', terms: false
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [consent, setConsent] = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === 'checkbox' ? checked : value;
    
    if (name === 'contact_number') {
      // Remove all non-digits
      const digits = v.replace(/\D/g, '');
      // Limit to 11 digits (typical PH mobile format starting with 09)
      v = digits.substring(0, 11);
    }
    
    setFormData(p => ({ ...p, [name]: v }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required to send verification code.' });
      return;
    }
    setOtpLoading(true);
    setErrors(p => ({ ...p, email: '' }));
    setOtpNotice('');
    try {
      const res = await authApi.sendOTP(formData.email);
      if (res?.otp_code) {
        setFormData(p => ({ ...p, otp_code: res.otp_code }));
      }
      setOtpNotice(res?.message || 'Verification code sent!');
      setOtpSent(true);
    } catch (err) {
      setErrors({ email: err.response?.data?.message || 'Failed to send code. Please use a valid email address.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.contact_number.length !== 11) {
      setErrors({ contact_number: 'Phone number must be exactly 11 digits (e.g., 09123456789).' });
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }
    if (!formData.terms) {
      setErrors({ terms: 'You must accept the Terms and Conditions.' });
      return;
    }
    if (!consent) {
      setErrors({ consent: 'You must provide consent for your personal information.' });
      return;
    }

    setLoading(true);
    try {
      // Convert 09... to +639... for the backend
      const formattedPhone = '+63' + formData.contact_number.substring(1);
      await register({ ...formData, contact_number: formattedPhone, terms: formData.terms ? '1' : '0' });
      setSuccess(true);
      setTimeout(() => nav('/patient'), 1500);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fieldErrors = {};
        Object.entries(errData.errors).forEach(([k, v]) => { fieldErrors[k] = v[0]; });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: errData?.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-start justify-center pt-8 pb-32 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" src={logoUrl} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join us as a patient</p>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
            <FaCheckCircle className="text-green-500 text-xl shrink-0" />
            <div><p className="font-semibold">Account created!</p><p className="text-sm">Redirecting to your dashboard...</p></div>
          </div>
        )}

        {errors.general && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
            {errors.general}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" name="first_name" required value={formData.first_name} onChange={handleChange} errors={errors} autoCapitalize="words" />
            <Field label="Last Name"  name="last_name"  required value={formData.last_name} onChange={handleChange} errors={errors} autoCapitalize="words" />
            <Field label="Middle Name (Optional)" name="middle_name" value={formData.middle_name} onChange={handleChange} errors={errors} autoCapitalize="words" />
            <Field label="Birth Date" name="birth_date" type="date" required value={formData.birth_date} onChange={handleChange} errors={errors} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sex <span className="text-red-500">*</span></label>
              <select name="sex" value={formData.sex} onChange={handleChange}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number <span className="text-red-500">*</span></label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-sm">
                  +63
                </span>
                <input name="contact_number" required inputMode="numeric"
                  value={formData.contact_number.startsWith('0') ? formData.contact_number.substring(1) : formData.contact_number} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'contact_number', value: '0' + val.substring(0, 10) } });
                  }}
                  placeholder="9XXXXXXXXX"
                  className={`flex-1 border rounded-r-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.contact_number ? 'border-red-400' : 'border-gray-300'}`} />
              </div>
              {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
            </div>
            <div className="md:col-span-2">
              <Field label="Address" name="address" required value={formData.address} onChange={handleChange} errors={errors} autoCapitalize="sentences" />
            </div>
          </div>

          <div className="border-t dark:border-slate-700 pt-4">
            <p className="font-semibold text-gray-800 dark:text-white mb-3">Account Security</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} 
                    className={`flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors.email ? 'border-red-400' : 'border-gray-300'}`} />
                  <button type="button" onClick={handleSendOTP} disabled={otpLoading || !formData.email}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                    {otpLoading ? <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> : <FaPaperPlane />}
                    {otpSent ? "Resend" : "Send Code"}
                  </button>
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                {otpSent && <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-medium italic">{otpNotice || 'Verification code sent!'}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Code <span className="text-red-500">*</span></label>
                <input name="otp_code" required value={formData.otp_code} onChange={handleChange} placeholder="Enter 6-digit code"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors.otp_code ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.otp_code && <p className="text-xs text-red-500 mt-1">{errors.otp_code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" type={showPw ? 'text' : 'password'} required minLength={8}
                    value={formData.password} onChange={handleChange}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    className={`w-full border rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password ? 'border-red-400' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input name="password_confirmation" type={showPw ? 'text' : 'password'} required
                  value={formData.password_confirmation} onChange={handleChange}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password_confirmation ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t dark:border-slate-700 pt-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-primary underline font-medium hover:opacity-80" onClick={() => setShowTerms(true)}>Terms and Conditions</button>
                {' '}and{' '}
                <button type="button" className="text-primary underline font-medium hover:opacity-80" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
                {' '}of MediQueue.
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors(p => ({ ...p, consent: '' })); }}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I consent to the collection, processing, and sharing of my personal information with the selected healthcare facility.
              </span>
            </label>
            {errors.consent && <p className="text-xs text-red-500 mt-1">{errors.consent}</p>}
          </div>
            {/* Terms Modal */}
            {showTerms && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
                  <button type="button" className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition" onClick={() => setShowTerms(false)}>✕</button>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Terms and Conditions</h2>
                  <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 space-y-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Last Updated: May 2026</p>
                    <p>Welcome to the MediQueue System. By creating an account, accessing, or using the platform, users agree to comply with the following Terms and Conditions.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">1. Acceptance of Terms</h3>
                    <p>By accessing or using the MediQueue System, users acknowledge that they have read, understood, and agreed to be bound by these Terms and Conditions, Privacy Policy, and applicable laws and regulations.</p>
                    <p>If a user does not agree with these terms, access to the platform should be discontinued immediately.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">2. Purpose of the Platform</h3>
                    <p>The MediQueue System is designed to provide:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Real-time doctor availability monitoring</li>
                      <li>Appointment scheduling</li>
                      <li>Queue management</li>
                      <li>Clinic announcements and notifications</li>
                      <li>Healthcare service information</li>
                    </ul>
                    <p>The platform serves as a scheduling and information management tool and does not provide medical diagnosis, treatment, or emergency healthcare services.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">3. User Registration and Account Responsibilities</h3>
                    <p>Users are required to provide accurate and complete information during registration.</p>
                    <p>Users are responsible for:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Maintaining the confidentiality of their account credentials</li>
                      <li>Ensuring information provided is accurate and updated</li>
                      <li>Securing access to their accounts</li>
                    </ul>
                    <p>The system reserves the right to suspend or terminate accounts that provide false, misleading, or fraudulent information.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">4. Identification Verification</h3>
                    <p>Patients may be required to upload a valid government-issued identification card or other approved identification documents for appointment verification purposes.</p>
                    <p>The submitted identification shall be used solely for:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Patient verification</li>
                      <li>Appointment confirmation</li>
                      <li>Fraud prevention</li>
                      <li>Healthcare facility requirements</li>
                    </ul>
                    <p>Submission of falsified identification documents may result in account termination and report to authorities.</p>
                  </div>
                </div>
              </div>
            )}
            {/* Privacy Policy Modal */}
            {showPrivacy && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
                  <button type="button" className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition" onClick={() => setShowPrivacy(false)}>✕</button>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h2>
                  <div className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 space-y-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Last Updated: May 2026</p>
                    <p>The MediQueue System ("MediQueue") is committed to protecting the privacy and security of our users' personal and health-related information.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">Information Collection</h3>
                    <p>We collect information necessary for the operation of the healthcare scheduling and queue management platform, including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Personal Identifiable Information (PII) such as name, contact details, and birth date</li>
                      <li>Medical and appointment history scheduled through the platform</li>
                      <li>Identification documents for verification purposes</li>
                    </ul>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">Use of Information</h3>
                    <p>The collected information is used to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Facilitate appointment scheduling and queue management</li>
                      <li>Verify patient identity to prevent fraud</li>
                      <li>Send system notifications and announcements</li>
                      <li>Improve healthcare service delivery</li>
                    </ul>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">Data Sharing</h3>
                    <p>User data may be shared with:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Selected healthcare facilities and designated medical professionals</li>
                      <li>Third-party service providers (e.g., cloud hosting, email notifications) under strict confidentiality agreements</li>
                    </ul>
                    <p>We will not sell, rent, or trade your personal information to unassociated third parties.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">Changes to This Privacy Policy</h3>
                    <p>The MediQueue System reserves the right to update this Privacy Policy when necessary. Users will be notified of significant changes through system notifications, email announcements, or platform updates.</p>

                    <h3 className="font-bold text-gray-900 dark:text-white mt-4">Contact Information</h3>
                    <p>For questions, concerns, or privacy-related requests, users may contact:</p>
                    <ul className="list-none">
                      <li><strong>Email:</strong> smartqueuesys@gmail.com</li>
                      <li><strong>Customer Support:</strong> +63 951 124 6064</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          <button type="submit" disabled={loading || success}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-95 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Creating Account...</>
            ) : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
