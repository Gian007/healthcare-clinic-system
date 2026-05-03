import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Services from "./pages/Services";
import Queue from "./pages/Queue";
import Announcements from "./pages/Announcements";

import Login from "./pages/Login";
import PatientDashboard from "./pages/patient/PatientDashboard";
import BookAppointment from "./pages/patient/BookAppointment";
import ReservationPayment from "./pages/patient/ReservationPayment";
import PaymentSubmitted from "./pages/patient/PaymentSubmitted";

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

// AUTH GUARD
function RequireAuth({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const location = useLocation();

  // Hide public navbar for staff/admin/doctor
  const hideNavbar =
    location.pathname.startsWith("/staff") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/doctor");

  return (
    <div className="min-h-screen bg-neutralbg">
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/services" element={<Services />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />

        {/* ================= PATIENT ================= */}
        <Route
          path="/patient"
          element={
            <RequireAuth role="patient">
              <PatientDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/patient/book"
          element={
            <RequireAuth role="patient">
              <BookAppointment />
            </RequireAuth>
          }
        />

        <Route
          path="/patient/payment"
          element={
            <RequireAuth role="patient">
              <ReservationPayment />
            </RequireAuth>
          }
        />

        <Route
          path="/patient/payment-submitted"
          element={
            <RequireAuth role="patient">
              <PaymentSubmitted />
            </RequireAuth>
          }
        />

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
          <Route path="notifications" element={<StaffNotifications />} />
        </Route>

        
        {/* ================= Admin ================= */}
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
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>



          {/* ================= FUTURE ================= */}
        <Route path="/doctor" element={<div className="p-6">Doctor (soon)</div>} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}