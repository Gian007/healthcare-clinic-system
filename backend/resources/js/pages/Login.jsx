import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { useAuth } from "../state/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Determine endpoint based on role 
      const endpoint = role === "patient"
        ? "http://127.0.0.1:8000/api/patient/login"
        : "http://127.0.0.1:8000/api/staff/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

     
      login({
        email,
        role,
        token: data.token,
        user: data.patient || data.staff,
      });

      
      if (next) return nav(next);
      if (role === "patient") return nav("/patient");
      if (role === "admin") return nav("/admin");
      if (role === "doctor") return nav("/doctor");
      if (role === "staff") return nav("/staff");
      return nav("/");

    } catch (err) {
      setError("Cannot connect to server. Make sure Laravel is running.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-neutralbg min-h-[calc(100vh-72px)] flex items-start justify-center pt-16 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <FaHeartbeat className="text-white text-3xl" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-600 mt-2">Login to your account</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left"
        >
          <div className="font-semibold text-gray-900 mb-4">Login</div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">Login as</label>
          <select
            className="mt-2 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Email
          </label>
          <input
            className="mt-2 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            type="email"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Password
          </label>
          <input
            type="password"
            className="mt-2 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}

            {/* register ui needed */}
            <span className="text-primary font-medium cursor-pointer">Register here</span>
          </div>
        </form>
      </div>
    </div>
  );
}