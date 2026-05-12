import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../state/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', middle_name: '',
    birth_date: '', sex: 'Male', contact_number: '',
    email: '', password: '', password_confirmation: '',
    address: '', terms: false
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === 'checkbox' ? checked : value;
    if (name === 'contact_number') v = v.replace(/\D/g, '');
    setFormData(p => ({ ...p, [name]: v }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }
    if (!formData.terms) {
      setErrors({ terms: 'You must accept the Terms and Conditions.' });
      return;
    }

    setLoading(true);
    try {
      await register({ ...formData, terms: formData.terms ? '1' : '0' });
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

  const Field = ({ label, name, type = 'text', required, className = '' }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        name={name} type={type} required={required}
        value={formData[name]} onChange={handleChange}
        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition ${errors[name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-start justify-center pt-8 pb-16 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm mb-4">
            <FaHeartbeat className="text-white text-2xl" />
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
            <Field label="First Name" name="first_name" required />
            <Field label="Last Name"  name="last_name"  required />
            <Field label="Middle Name (Optional)" name="middle_name" />
            <Field label="Birth Date" name="birth_date" type="date" required />
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
              <input name="contact_number" required inputMode="numeric" pattern="[0-9]*"
                value={formData.contact_number} onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.contact_number ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.contact_number && <p className="text-xs text-red-500 mt-1">{errors.contact_number}</p>}
            </div>
            <div className="md:col-span-2">
              <Field label="Address" name="address" required />
            </div>
          </div>

          <div className="border-t dark:border-slate-700 pt-4">
            <p className="font-semibold text-gray-800 dark:text-white mb-3">Account Details</p>
            <div className="space-y-4">
              <Field label="Email Address" name="email" type="email" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" type={showPw ? 'text' : 'password'} required minLength={8}
                    value={formData.password} onChange={handleChange}
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
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password_confirmation ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t dark:border-slate-700 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange}
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-primary underline font-medium hover:opacity-80">Terms and Conditions</button>
                {' '}and{' '}
                <button type="button" className="text-primary underline font-medium hover:opacity-80">Privacy Policy</button>
                {' '}of HealthCare Clinic.
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
          </div>

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
