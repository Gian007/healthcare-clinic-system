import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCalendarAlt, FaHome } from "react-icons/fa";

export default function PaymentSubmitted() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="max-w-lg mx-auto text-center py-10">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 grid place-items-center mx-auto mb-6">
          <FaCheckCircle className="text-4xl" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h1>
        <p className="text-gray-500 mb-8">
          Your reservation payment has been received. We will verify your payment and send you a confirmation notification shortly.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-green-800 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>Our staff will verify your payment within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>You'll receive a confirmation notification via email/SMS</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>Your appointment will be confirmed and visible in your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0" />
              <span>Please arrive 15 minutes before your scheduled time</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/patient")}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            <FaHome /> Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/patient/book")}
            className="inline-flex items-center justify-center gap-2 border border-primary text-primary px-6 py-3 rounded-xl font-medium hover:bg-primary/5 transition"
          >
            <FaCalendarAlt /> Book Another
          </button>
        </div>
      </div>
    </div>
  );
}
