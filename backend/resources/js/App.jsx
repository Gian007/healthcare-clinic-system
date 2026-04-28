import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import './bootstrap';

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

import { useAuth } from "@/state/auth";

// simple role guard
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutralbg">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/services" element={<Services />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/announcements" element={<Announcements />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Patient (protected) */}
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

        {/* Placeholder routes for later */}
        <Route path="/admin" element={<div className="p-6">Admin (soon)</div>} />
        <Route path="/doctor" element={<div className="p-6">Doctor (soon)</div>} />
        <Route path="/staff" element={<div className="p-6">Staff (soon)</div>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}