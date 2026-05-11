import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import { PageHeader, TextInput, SelectInput } from "../../components/admin/AdminUI";

export default function AdminSettings() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem("admin_profile") || "null") || {
      name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Admin User",
      email: user?.email || "admin@healthcare.test",
      role: "System Administrator",
      clinic: "HealthCare Clinic",
      contact: "0917-000-0000",
    }
  );
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("admin_profile", JSON.stringify(profile));
  }, [profile]);

  const handleSave = () => {
    setNotice("Settings saved successfully!");
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Admin profile and system display settings." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Profile Form */}
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="font-bold text-lg mb-5">Profile Settings</h2>

          {notice && (
            <div className="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-3 flex items-center gap-2">
              <span>✓</span> {notice}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Admin Name"
              value={profile.name}
              onChange={(v) => setProfile({ ...profile, name: v })}
            />
            <TextInput
              label="Email"
              value={profile.email}
              onChange={(v) => setProfile({ ...profile, email: v })}
            />
            <TextInput
              label="Clinic Name"
              value={profile.clinic}
              onChange={(v) => setProfile({ ...profile, clinic: v })}
            />
            <TextInput
              label="Contact"
              value={profile.contact}
              onChange={(v) => setProfile({ ...profile, contact: v })}
            />
            <SelectInput
              label="Role"
              value={profile.role}
              onChange={(v) => setProfile({ ...profile, role: v })}
              options={["System Administrator", "Clinic Manager", "Super Admin"]}
            />
            <div className="flex items-end">
              <button
                onClick={handleSave}
                className="w-full rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors text-white py-3 font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="mx-auto h-24 w-24 rounded-full bg-teal-500 text-white grid place-items-center text-3xl font-bold">
            {profile.name?.[0] || "A"}
          </div>
          <h2 className="text-center font-bold mt-4 text-slate-900 dark:text-white">{profile.name}</h2>
          <p className="text-center text-sm text-slate-500">{profile.role}</p>

          <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Clinic</span>
              <span className="font-medium">{profile.clinic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact</span>
              <span className="font-medium">{profile.contact}</span>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800">
            <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm text-teal-800 dark:text-teal-200">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
