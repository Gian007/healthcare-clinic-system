import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../state/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const next = useMemo(() => sp.get("next"), [sp]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password, role });
      
      if (next) {
        nav(next);
      } else {
        const returnedRole = data.role;
        if (returnedRole === "patient") nav("/patient");
        else if (returnedRole === "admin") nav("/admin");
        else if (returnedRole === "doctor") nav("/doctor");
        else if (returnedRole === "staff") nav("/staff");
        else nav("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || err.response?.data?.errors?.password?.[0]
        || "Login failed. Please check your credentials and the role you selected.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutralbg dark:bg-slate-950 min-h-[calc(100vh-72px)] flex items-start justify-center pt-16 px-6 transition-colors">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 rotate-3 transition-transform hover:rotate-0 duration-500 text-primary">
          <FaHeartbeat className="text-4xl" />
        </div>

        <h1 className="mt-6 text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase font-comfortaa leading-none font-fat">SHQMS</h1>
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1 font-poppins">Smart Healthcare Availability</p>
        <p className="text-sm italic font-medium text-gray-600 dark:text-gray-400 mt-4 font-playfair">"Skip the Wait, Get the Care."</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 text-left"
        >
          <div className="font-semibold text-gray-900 dark:text-white mb-4">Login</div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login as</label>
          <select
            className="mt-2 w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
            Email
          </label>
          <input
            type="text"
            required
            className="mt-2 w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />

          <div className="flex justify-between items-center mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-primary/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-95 disabled:opacity-50 shadow-sm"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {role === 'patient' && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
