import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { useAuth } from "../state/auth";

export default function Login() {
  const [email, setEmail] = useState("gianexample@gmail.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const next = useMemo(() => sp.get("next"), [sp]);

  const onSubmit = (e) => {
    e.preventDefault();

    // dummy login success
    login({ email, role });

    if (next) return nav(next);

    if (role === "patient") return nav("/patient");
    if (role === "admin") return nav("/admin");
    if (role === "doctor") return nav("/doctor");
    if (role === "staff") return nav("/staff");
    return nav("/");
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
            Email or Phone
          </label>
          <input
            className="mt-2 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
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
            className="mt-5 w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-95"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <span className="text-primary font-medium cursor-pointer">Register here</span>
          </div>
        </form>
      </div>
    </div>
  );
}
