import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../state/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    birth_date: '',
    sex: 'Male',
    contact_number: '',
    email: '',
    password: '',
    password_confirmation: '',
    address: ''
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "contact_number") {
      value = value.replace(/\D/g, "");
    }
    setFormData({...formData, [name]: value});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      nav("/patient");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
      if (err.response?.data?.errors) {
        const errMap = err.response.data.errors;
        const allErrors = Object.values(errMap).flat().join(" • ");
        setError(allErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutralbg min-h-[calc(100vh-72px)] flex items-start justify-center pt-8 pb-16 px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <FaHeartbeat className="text-white text-3xl" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-600 mt-2">Join us as a patient</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="first_name" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.first_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="last_name" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.last_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name (Optional)</label>
              <input
                name="middle_name"
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.middle_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Date</label>
              <input
                type="date" name="birth_date" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.birth_date} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sex</label>
              <select
                name="sex"
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.sex} onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                name="contact_number" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.contact_number} onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                name="address" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.address} onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2 mt-4 border-t pt-4">
              <div className="font-semibold text-gray-900 mb-2">Account Details</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email" name="email" required
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                value={formData.email} onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"} name="password" required minLength="8"
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                value={formData.password} onChange={handleChange}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"} name="password_confirmation" required minLength="8"
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                value={formData.password_confirmation} onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-95 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium cursor-pointer">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
