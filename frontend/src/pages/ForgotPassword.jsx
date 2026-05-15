import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaHeartbeat, FaCheckCircle } from "react-icons/fa";
import * as authApi from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm mb-4">
            <FaHeartbeat className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter your email to receive a password reset link.</p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 text-center space-y-4">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400">If your email is registered, we've sent you a password reset link.</p>
            <Link to="/login" className="inline-block mt-4 text-primary font-semibold hover:underline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-95 disabled:opacity-50 transition">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Remember your password? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
