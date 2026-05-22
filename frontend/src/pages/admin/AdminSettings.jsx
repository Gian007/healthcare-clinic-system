import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Home, ImagePlus, Loader2, Mail, Palette, Save, Settings2, Share2, ToggleLeft } from "lucide-react";
import { useAuth } from "../../state/auth";
import { useAdminSettings } from "../../state/adminSettings";
import { PageHeader, TextInput } from "../../components/admin/AdminUI";
import * as adminApi from "../../api/adminApi";
import ImageCropper from "../../components/ImageCropper";
import { DEFAULT_ADMIN_SETTINGS, mergeAdminSettings, resolveLogoUrl } from "../../config/adminSettings";

const menuOptions = [
  ["doctors", "Doctors"],
  ["schedules", "Schedules"],
  ["services", "Services"],
  ["staff", "Staff Management"],
  ["patients", "Patient Accounts"],
  ["calendar", "Clinic Calendar"],
  ["notifications", "Notifications"],
  ["reports", "Reports"],
];

const widgetOptions = [
  ["totalPatients", "Total Patients"],
  ["totalDoctors", "Total Doctors"],
  ["totalStaff", "Total Staff"],
  ["appointmentsToday", "Appointments Today"],
  ["pendingVerifications", "Pending Verifications"],
  ["activeAppointments", "Active Appointments"],
  ["recentPatients", "Recently Registered Patients"],
  ["quickActions", "Quick Actions"],
  ["recentAppointments", "Recent Appointments"],
];

const patientMenuOptions = [
  ["dashboard", "Dashboard"],
  ["bookAppointment", "Book Appointment"],
  ["calendar", "Calendar"],
  ["profile", "Profile"],
];

const doctorMenuOptions = [
  ["dashboard", "Dashboard"],
  ["schedule", "My Schedule"],
  ["dayOff", "Day Off Request"],
  ["appointments", "Appointments"],
  ["queue", "My Queue"],
  ["attendance", "Attendance"],
  ["calendar", "Clinic Calendar"],
  ["notifications", "Notifications"],
  ["profile", "Profile"],
];

const guestMenuOptions = [
  ["doctors", "Doctors"],
  ["services", "Services"],
  ["queue", "Queue"],
  ["announcements", "Announcements"],
];

function SettingsCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
          <Icon size={20} />
        </span>
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
      />
    </label>
  );
}

function ToggleGroup({ title, options, values, settingPath }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {options.map(([key, label]) => (
          <ToggleRow
            key={key}
            label={label}
            checked={values[key]}
            onChange={(checked) => settingPath(key, checked)}
          />
        ))}
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  const swatchValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#1FA4A9";

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-200">{label}</span>
      <div className="mt-1 flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        <input
          type="color"
          value={swatchValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none dark:text-white"
        />
      </div>
    </label>
  );
}

function TextAreaInput({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-200">{label}</span>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </label>
  );
}

export default function AdminSettings() {
  const { user, fetchUser } = useAuth();
  const { settings, setSettings } = useAdminSettings();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [portal, setPortal] = useState(() => mergeAdminSettings(settings));

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPortal, setSavingPortal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [cropImage, setCropImage] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
      });
    }
  }, [user]);

  useEffect(() => {
    setPortal(mergeAdminSettings(settings));
  }, [settings]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const updatePortal = (path, value) => {
    setPortal((current) => {
      const next = JSON.parse(JSON.stringify(current));
      const keys = path.split(".");
      const lastKey = keys.pop();
      const target = keys.reduce((acc, key) => acc[key], next);
      target[lastKey] = value;
      return next;
    });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrors({});
    try {
      await adminApi.updateProfile(profile);
      await fetchUser();
      showSuccess("Profile updated successfully.");
    } catch (err) {
      setErrors(err.response?.data?.errors || { profile: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match." });
      return;
    }
    setSavingPassword(true);
    setErrors({});
    try {
      await adminApi.updatePassword(passwords);
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
      showSuccess("Password changed successfully.");
    } catch (err) {
      setErrors(err.response?.data?.errors || { password_general: err.response?.data?.message || "Failed to change password." });
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropImage(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", croppedBlob, "profile.jpg");
    try {
      await adminApi.uploadPhoto(fd);
      await fetchUser();
      showSuccess("Profile picture updated.");
    } catch (err) {
      setErrors({ profile: "Failed to upload photo." });
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("logo", file);
    setUploadingLogo(true);
    setErrors({});

    try {
      const response = await adminApi.uploadBrandLogo(fd);
      const nextSettings = setSettings(response.settings);
      setPortal(nextSettings);
      showSuccess("Brand logo updated.");
    } catch (err) {
      setErrors(err.response?.data?.errors || { portal: err.response?.data?.message || "Failed to upload logo." });
    } finally {
      setUploadingLogo(false);
      e.target.value = null;
    }
  };

  const handlePortalSave = async (e) => {
    e.preventDefault();
    setSavingPortal(true);
    setErrors({});

    try {
      const response = await adminApi.updateSettings(portal);
      const nextSettings = setSettings(response.settings);
      setPortal(nextSettings);
      showSuccess("Portal settings saved.");
    } catch (err) {
      setErrors(err.response?.data?.errors || { portal: err.response?.data?.message || "Failed to save portal settings." });
    } finally {
      setSavingPortal(false);
    }
  };

  const handlePortalReset = async () => {
    if (!window.confirm("Are you sure you want to reset all portal settings to their original defaults?")) {
      return;
    }
    setSavingPortal(true);
    setErrors({});

    try {
      const response = await adminApi.updateSettings(DEFAULT_ADMIN_SETTINGS);
      const nextSettings = setSettings(response.settings);
      setPortal(nextSettings);
      showSuccess("Portal settings reset to defaults successfully.");
    } catch (err) {
      setErrors(err.response?.data?.errors || { portal: err.response?.data?.message || "Failed to reset portal settings." });
    } finally {
      setSavingPortal(false);
    }
  };

  const photoUrl = user?.profile_picture
    ? (user.profile_picture.startsWith("http") ? user.profile_picture : `${import.meta.env.VITE_BACKEND_URL}/storage/${user.profile_picture}`)
    : null;
  const logoUrl = resolveLogoUrl(portal.branding.logoPath);

  return (
    <div className="admin-settings-page">
      {cropImage && <ImageCropper image={cropImage} onCancel={() => setCropImage(null)} onCropComplete={handleCropComplete} />}
      <PageHeader title="Account Settings" subtitle="Manage your admin profile, email, and security." />

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-100 p-4 text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle2 size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errors.portal && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{errors.portal}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <form onSubmit={handleProfileSave} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
            {errors.profile && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{errors.profile}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <TextInput label="First Name" value={profile.first_name} onChange={(v) => setProfile((p) => ({ ...p, first_name: v }))} />
                {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
              </div>
              <div>
                <TextInput label="Last Name" value={profile.last_name} onChange={(v) => setProfile((p) => ({ ...p, last_name: v }))} />
                {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
              </div>
              <div>
                <TextInput label="Email Address" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <TextInput label="Contact Number" value={profile.contact_number} onChange={(v) => setProfile((p) => ({ ...p, contact_number: v }))} />
                {errors.contact_number && <p className="mt-1 text-xs text-red-500">{errors.contact_number}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={savingProfile} className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSave} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
            {errors.password_general && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">{errors.password_general}</div>}

            <div className="max-w-md space-y-4">
              <div>
                <TextInput label="Current Password" type="password" value={passwords.current_password} onChange={(v) => setPasswords((p) => ({ ...p, current_password: v }))} />
                {errors.current_password && <p className="mt-1 text-xs text-red-500">{errors.current_password}</p>}
              </div>
              <div>
                <TextInput label="New Password" type="password" value={passwords.password} onChange={(v) => setPasswords((p) => ({ ...p, password: v }))} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <TextInput label="Confirm New Password" type="password" value={passwords.password_confirmation} onChange={(v) => setPasswords((p) => ({ ...p, password_confirmation: v }))} />
                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
              </div>
            </div>

            <div className="mt-6">
              <button type="submit" disabled={savingPassword} className="rounded-xl bg-slate-800 px-6 py-2.5 font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600">
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <div className="group relative mx-auto mb-4 h-32 w-32">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-4xl font-bold text-teal-600 shadow-md dark:border-slate-900 dark:bg-slate-800">
              {uploading ? (
                <Loader2 className="animate-spin text-gray-400" />
              ) : photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.first_name?.[0] || "A"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full bg-primary p-2.5 text-white shadow-lg transition-transform hover:scale-105"
            >
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>

          <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-primary">System Administrator</p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="mb-1 text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{user?.email}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="mb-1 text-xs text-gray-500">Contact Number</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{user?.contact_number || "-"}</p>
            </div>
          </div>
        </aside>
      </div>

      <form onSubmit={handlePortalSave} className="mt-6 space-y-6">
        <PageHeader title="Portal Settings" subtitle="Branding, navigation, dashboard, and theme controls." />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SettingsCard title="Branding" icon={ImagePlus}>
            <div className="space-y-4">
              <TextInput label="Clinic Name" value={portal.branding.clinicName} onChange={(v) => updatePortal("branding.clinicName", v)} />
              <TextInput label="Sidebar Tagline" value={portal.branding.tagline} onChange={(v) => updatePortal("branding.tagline", v)} />

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    {logoUrl ? <img src={logoUrl} alt="Clinic logo" className="h-full w-full object-cover" /> : <ImagePlus size={24} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{portal.branding.clinicName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{portal.branding.tagline || "Admin Portal"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </button>
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                {errors.logo && <p className="mt-2 text-xs text-red-500">{errors.logo}</p>}
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Toggle Features" icon={ToggleLeft}>
            <div className="space-y-6">
              <ToggleGroup
                title="Admin Sidebar"
                options={menuOptions}
                values={portal.features.menuItems}
                settingPath={(key, checked) => updatePortal(`features.menuItems.${key}`, checked)}
              />
              <ToggleGroup
                title="Patient Navbar"
                options={patientMenuOptions}
                values={portal.features.patientMenuItems}
                settingPath={(key, checked) => updatePortal(`features.patientMenuItems.${key}`, checked)}
              />
              <ToggleGroup
                title="Doctor Navbar"
                options={doctorMenuOptions}
                values={portal.features.doctorMenuItems}
                settingPath={(key, checked) => updatePortal(`features.doctorMenuItems.${key}`, checked)}
              />
              <ToggleGroup
                title="Guest Navbar"
                options={guestMenuOptions}
                values={portal.features.guestMenuItems}
                settingPath={(key, checked) => updatePortal(`features.guestMenuItems.${key}`, checked)}
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Theme Settings" icon={Palette}>
            <div className="space-y-4">
              <ColorInput label="Accent Color" value={portal.theme.accentColor} onChange={(value) => updatePortal("theme.accentColor", value)} />
              <ColorInput label="Sidebar Color" value={portal.theme.sidebarColor} onChange={(value) => updatePortal("theme.sidebarColor", value)} />

              <div>
                <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-200">Font Size</p>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {["compact", "comfortable", "large"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updatePortal("theme.fontSize", size)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${
                        portal.theme.fontSize === size
                          ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>

        <SettingsCard title="Dashboard Widgets" icon={Settings2}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {widgetOptions.map(([key, label]) => (
              <ToggleRow
                key={key}
                label={label}
                checked={portal.features.dashboardWidgets[key]}
                onChange={(checked) => updatePortal(`features.dashboardWidgets.${key}`, checked)}
              />
            ))}
          </div>
        </SettingsCard>

        <PageHeader title="Homepage Content" subtitle="Edit the public landing page text, emergency details, contact information, and footer links." />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SettingsCard title="Hero Section" icon={Home}>
            <div className="space-y-4">
              <TextInput label="Hero Subtitle" value={portal.homepage.hero.subtitle} onChange={(v) => updatePortal("homepage.hero.subtitle", v)} />
              <TextInput label="Hero Quote" value={portal.homepage.hero.quote} onChange={(v) => updatePortal("homepage.hero.quote", v)} />
              <TextInput label="Booking Button Label" value={portal.homepage.hero.ctaLabel} onChange={(v) => updatePortal("homepage.hero.ctaLabel", v)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Schedule & Emergency" icon={AlertTriangle}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Schedule Title" value={portal.homepage.schedule.title} onChange={(v) => updatePortal("homepage.schedule.title", v)} />
              <TextInput label="Loading Text" value={portal.homepage.schedule.loadingText} onChange={(v) => updatePortal("homepage.schedule.loadingText", v)} />
              <TextInput label="Open Text" value={portal.homepage.schedule.openText} onChange={(v) => updatePortal("homepage.schedule.openText", v)} />
              <TextInput label="Open Shortened Text" value={portal.homepage.schedule.openShortenedText} onChange={(v) => updatePortal("homepage.schedule.openShortenedText", v)} />
              <TextInput label="Closed Today Text" value={portal.homepage.schedule.closedTodayText} onChange={(v) => updatePortal("homepage.schedule.closedTodayText", v)} />
              <TextInput label="Closed Now Text" value={portal.homepage.schedule.closedNowText} onChange={(v) => updatePortal("homepage.schedule.closedNowText", v)} />
              <TextInput label="Clinic Closed Text" value={portal.homepage.schedule.clinicClosedText} onChange={(v) => updatePortal("homepage.schedule.clinicClosedText", v)} />
              <TextInput label="Special Schedule Label" value={portal.homepage.schedule.specialScheduleLabel} onChange={(v) => updatePortal("homepage.schedule.specialScheduleLabel", v)} />
              <TextInput label="Emergency Title" value={portal.homepage.emergency.title} onChange={(v) => updatePortal("homepage.emergency.title", v)} />
              <TextInput label="Emergency Hotline" value={portal.homepage.emergency.hotline} onChange={(v) => updatePortal("homepage.emergency.hotline", v)} />
              <div className="md:col-span-2">
                <TextAreaInput label="Emergency Message" value={portal.homepage.emergency.message} onChange={(v) => updatePortal("homepage.emergency.message", v)} />
              </div>
              <div className="md:col-span-2">
                <TextInput label="Emergency Caption" value={portal.homepage.emergency.caption} onChange={(v) => updatePortal("homepage.emergency.caption", v)} />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Contact Details" icon={Mail}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextAreaInput label="Footer Brand Description" value={portal.homepage.contact.description} onChange={(v) => updatePortal("homepage.contact.description", v)} />
              </div>
              <TextInput label="Location Label" value={portal.homepage.contact.locationTitle} onChange={(v) => updatePortal("homepage.contact.locationTitle", v)} />
              <TextInput label="Address" value={portal.homepage.contact.address} onChange={(v) => updatePortal("homepage.contact.address", v)} />
              <TextInput label="Contact Section Title" value={portal.homepage.contact.sectionTitle} onChange={(v) => updatePortal("homepage.contact.sectionTitle", v)} />
              <TextInput label="Email Label" value={portal.homepage.contact.emailLabel} onChange={(v) => updatePortal("homepage.contact.emailLabel", v)} />
              <TextInput label="Email Address" value={portal.homepage.contact.email} onChange={(v) => updatePortal("homepage.contact.email", v)} />
              <TextInput label="Customer Service Label" value={portal.homepage.contact.customerServiceLabel} onChange={(v) => updatePortal("homepage.contact.customerServiceLabel", v)} />
              <TextInput label="Customer Service Phone" value={portal.homepage.contact.customerServicePhone} onChange={(v) => updatePortal("homepage.contact.customerServicePhone", v)} />
              <TextInput label="Manager Label" value={portal.homepage.contact.managerLabel} onChange={(v) => updatePortal("homepage.contact.managerLabel", v)} />
              <TextInput label="Manager Phone" value={portal.homepage.contact.managerPhone} onChange={(v) => updatePortal("homepage.contact.managerPhone", v)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Social & Footer" icon={Share2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Social Section Title" value={portal.homepage.social.sectionTitle} onChange={(v) => updatePortal("homepage.social.sectionTitle", v)} />
              <TextInput label="Facebook Label" value={portal.homepage.social.facebookLabel} onChange={(v) => updatePortal("homepage.social.facebookLabel", v)} />
              <div className="md:col-span-2">
                <TextInput label="Facebook URL" value={portal.homepage.social.facebookUrl} onChange={(v) => updatePortal("homepage.social.facebookUrl", v)} />
              </div>
              <TextInput label="Instagram Label" value={portal.homepage.social.instagramLabel} onChange={(v) => updatePortal("homepage.social.instagramLabel", v)} />
              <div className="md:col-span-2">
                <TextInput label="Instagram URL" value={portal.homepage.social.instagramUrl} onChange={(v) => updatePortal("homepage.social.instagramUrl", v)} />
              </div>
              <div className="md:col-span-2">
                <TextInput label="Copyright Text" value={portal.homepage.footer.copyright} onChange={(v) => updatePortal("homepage.footer.copyright", v)} />
              </div>
              <TextInput label="Privacy Label" value={portal.homepage.footer.privacyLabel} onChange={(v) => updatePortal("homepage.footer.privacyLabel", v)} />
              <TextInput label="Privacy URL" value={portal.homepage.footer.privacyUrl} onChange={(v) => updatePortal("homepage.footer.privacyUrl", v)} />
              <TextInput label="Terms Label" value={portal.homepage.footer.termsLabel} onChange={(v) => updatePortal("homepage.footer.termsLabel", v)} />
              <TextInput label="Terms URL" value={portal.homepage.footer.termsUrl} onChange={(v) => updatePortal("homepage.footer.termsUrl", v)} />
            </div>
          </SettingsCard>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handlePortalReset}
            disabled={savingPortal}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-3 font-semibold text-white transition disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            type="submit"
            disabled={savingPortal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {savingPortal ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {savingPortal ? "Saving Settings..." : "Save Portal Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
