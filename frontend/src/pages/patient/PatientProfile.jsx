import { useState, useEffect } from "react";
import { useAuth } from "../../state/auth";
import axios from "axios";

export default function PatientProfile() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    contact_number: user?.contact_number || "",
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    birth_date: user?.birth_date || "",
    name_change_reason: ""
  });
  
  const [idFile, setIdFile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIdUpload = async (e) => {
    e.preventDefault();
    if (!idFile) return setMessage("Please select an ID image");
    setLoading(true);
    const fd = new FormData();
    fd.append("id_image", idFile);
    
    try {
      await axios.post("/api/patient/verify-id", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setMessage("ID uploaded successfully. Your ID is under review. You may still book while verification is pending.");
      // In a real app, update user state here
    } catch (err) {
      setMessage("Failed to upload ID");
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/patient/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      {message && <div className="p-4 bg-teal-50 text-teal-700 rounded-lg">{message}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Verification Status</h2>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user?.verification_status === "Approved" ? "bg-green-100 text-green-700" :
            user?.verification_status === "Under Review" ? "bg-yellow-100 text-yellow-700" :
            user?.verification_status === "Rejected" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {user?.verification_status || "Pending"}
          </span>
          {user?.verification_status === "Rejected" && (
             <span className="text-sm text-red-500">Reason: Invalid ID provided.</span>
          )}
        </div>

        {(user?.verification_status === "Pending" || user?.verification_status === "Rejected") && (
          <form onSubmit={handleIdUpload} className="mt-6 border-t dark:border-slate-800 pt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Upload Valid ID</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Required before booking an appointment. Single image only.</p>
            <input type="file" accept="image/*" onChange={e => setIdFile(e.target.files[0])} className="block w-full text-sm text-gray-500 mb-4" />
            <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Submit ID</button>
          </form>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Personal Information</h2>
        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
            <input name="contact_number" value={formData.contact_number} onChange={handleChange} className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Name Change</label>
            <input name="name_change_reason" value={formData.name_change_reason} onChange={handleChange} placeholder="Required if changing name" className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</label>
            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="mt-1 w-full border dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 outline-none" />
          </div>
          <div className="md:col-span-2 mt-4 text-right">
            <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg font-medium">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
