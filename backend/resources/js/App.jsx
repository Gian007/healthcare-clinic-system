// src/App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MobileBlocker from "./components/MobileBlocker";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Services from "./pages/Services";
import Queue from "./pages/Queue";
import Announcements from "./pages/Announcements";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PatientLayout from "./components/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientProfile from "./pages/patient/PatientProfile";
import ClinicCalendar from "./pages/ClinicCalendar";

import { useAuth } from "./state/auth";

// STAFF IMPORTS
import StaffLayout from "./components/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffQueue from "./pages/staff/StaffQueue";
import StaffAppointments from "./pages/staff/StaffAppointments";
import StaffWalkIn from "./pages/staff/StaffWalkIn";
import StaffPatients from "./pages/staff/StaffPatients";
import StaffNotifications from "./pages/staff/StaffNotifications";
import StaffScan from "./pages/staff/StaffScan";
import StaffSchedule from "./pages/staff/StaffSchedule";
import StaffProfile from "./pages/staff/StaffProfile";

// ADMIN IMPORTS
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminServices from "./pages/admin/AdminServices";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";


// DOCTOR IMPORTS
import DoctorLayout from "./components/doctor/DoctorLayout";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorDayOff from "./pages/doctor/DoctorDayOff";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorQueue from "./pages/doctor/DoctorQueue";
import DoctorAttendance from "./pages/doctor/DoctorAttendance";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";


// AUTH GUARD
function RequireAuth({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile && user && (user.role === "admin" || user.role === "staff")) {
    return <MobileBlocker />;
  }

  // Hide public navbar for staff/admin/doctor/patient (they all have their own layout)
  const hideNavbar =
    location.pathname.startsWith("/staff/") ||
    location.pathname.startsWith("/admin/") ||
    location.pathname.startsWith("/doctor/") ||
    location.pathname.startsWith("/patient/") ||
    ["/staff", "/admin", "/doctor", "/patient"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-neutralbg dark:bg-slate-950 transition-colors duration-200">
      {!hideNavbar && <Navbar />}

      <div className={!hideNavbar ? "pt-[72px]" : ""}>
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/announcements" element={<Announcements />} />

          {/* ================= AUTH ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ================= PATIENT ================= */}
          <Route
            path="/patient"
            element={
              <RequireAuth role="patient">
                <PatientLayout />
              </RequireAuth>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="calendar" element={<ClinicCalendar />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* ================= STAFF ================= */}
          <Route
            path="/staff"
            element={
              <RequireAuth role="staff">
                <StaffLayout />
              </RequireAuth>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="queue" element={<StaffQueue />} />
            <Route path="scan" element={<StaffScan />} />
            <Route path="appointments" element={<StaffAppointments />} />
            <Route path="walk-in" element={<StaffWalkIn />} />
            <Route path="patients" element={<StaffPatients />} />
            <Route path="schedule" element={<StaffSchedule />} />
            <Route path="calendar" element={<ClinicCalendar />} />
            <Route path="notifications" element={<StaffNotifications />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="calendar" element={<ClinicCalendar />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>


          <Route
            path="/doctor"
            element={
              <RequireAuth role="doctor">
                <DoctorLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="dayoff" element={<DoctorDayOff />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="queue" element={<DoctorQueue />} />
            <Route path="attendance" element={<DoctorAttendance />} />
            <Route path="calendar" element={<ClinicCalendar />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>


          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}