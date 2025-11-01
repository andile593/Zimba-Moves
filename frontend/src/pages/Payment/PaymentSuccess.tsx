import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, ArrowRight, Home, FileText } from "lucide-react";
import { useVerifyPayment } from "../../hooks/usePayment";
import { useBooking } from "../../hooks/useBooking";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null);
  const hasVerified = useRef(false);

  const reference = searchParams.get("reference");
  const bookingId = searchParams.get("bookingId");

  const { mutate: verifyPayment, isPending } = useVerifyPayment();
  const { data: booking, refetch: refetchBooking } = useBooking(
    bookingId || ""
  );

  useEffect(() => {
    console.log("🟡 useEffect triggered with reference:", reference);
    console.log("🟡 hasVerified:", hasVerified.current);

    if (!reference || hasVerified.current) {
      if (!reference) setVerificationStatus("error");
      return;
    }

    hasVerified.current = true;
    console.log("🟢 Calling verifyPayment now...");

    verifyPayment(
      { id: reference },
      {
        onSuccess: (verifiedPayment) => {
          console.log("✅ onSuccess fired:", verifiedPayment);

          if (verifiedPayment?.status === "PAID") {
            setVerificationStatus("success");
          } else {
            setVerificationStatus("error");
          }
        },
        onError: (error) => {
          console.error("❌ Verification error:", error);
          setVerificationStatus("error");
        },
      }
    );
  }, [reference, verifyPayment]);

  // Verifying state
  if (verificationStatus === "verifying" || isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md border border-red-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-8">
            We couldn't verify your payment. Please contact support if you were
            charged.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/bookings", { replace: true })}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              View My Bookings
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="w-full bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md border border-green-100">
        {/* Success Icon with Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-bounce-slow">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-2">
          Your payment has been processed successfully.
        </p>

        {booking && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Booking Amount</span>
              <span className="text-2xl font-bold text-green-600">
                R{booking.pricing?.total?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                {booking.paymentStatus || "PAID"}
              </span>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-8">
          You'll receive a confirmation email shortly with your booking details.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {bookingId && (
            <button
              onClick={() =>
                navigate(`/bookings/${bookingId}`, { replace: true })
              }
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              View Booking Details
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => navigate("/bookings", { replace: true })}
            className="w-full bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            View All Bookings
          </button>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full text-gray-600 px-6 py-3 rounded-xl font-medium hover:text-gray-900 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
