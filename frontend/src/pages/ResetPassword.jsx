import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaHeartbeat, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import * as authApi from "../api/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({ password: '', password_confirmation: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;
    
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }

    setLoading(true); setError(''); setErrors({});
    try {
      await authApi.resetPassword({ token, email, ...formData });
      setSuccess(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const e = {};
        Object.entries(err.response.data.errors).forEach(([k,v]) => e[k] = v[0]);
        setErrors(e);
      } else {
        setError(err.response?.data?.message || 'Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/forgot-password" className="text-primary hover:underline">Go to Forgot Password</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm mb-4">
            <FaHeartbeat className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center space-y-4">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password Reset Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400">You can now log in with your new password.</p>
            <Link to="/login" className="inline-block mt-4 w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-95">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input name="password_confirmation" type={showPw ? 'text' : 'password'} required
                value={formData.password_confirmation} onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password_confirmation ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-95 disabled:opacity-50 transition">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
