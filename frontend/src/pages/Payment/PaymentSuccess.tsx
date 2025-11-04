import { useBooking } from "@/hooks/useBooking";
import { verifyPayment } from "@/services/paymentApi";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, FileText, Home, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const reference = searchParams.get("reference");
  const bookingId = searchParams.get("bookingId");

  // Automatically verify payment on mount
  const { 
    data: verifiedPayment, 
    isLoading, 
    isError,
    refetch: refetchVerification 
  } = useQuery({
    queryKey: ['payment-verification', reference],
    queryFn: async () => {
      const response = await verifyPayment({ id: reference! });
      return response.data;
    },
    enabled: !!reference,
    retry: 3,
    retryDelay: 2000,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Fetch booking details
  const { data: booking, refetch: refetchBooking } = useBooking(bookingId || "", {
    enabled: !!bookingId,
  });

  // Poll booking status if payment is verified but booking hasn't updated
  useEffect(() => {
    if (verifiedPayment?.status === 'PAID' && booking?.paymentStatus !== 'PAID') {
      const interval = setInterval(() => {
        console.log('Polling booking status...');
        refetchBooking();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [verifiedPayment?.status, booking?.paymentStatus, refetchBooking]);

  // Auto-refresh verification every 5 seconds if still pending
  useEffect(() => {
    if (verifiedPayment?.status !== 'PAID' && !isLoading && !isError) {
      const interval = setInterval(() => {
        console.log('Re-verifying payment...');
        refetchVerification();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [verifiedPayment?.status, isLoading, isError, refetchVerification]);

  // Manual refresh handler
  const handleRefresh = async () => {
    await Promise.all([
      refetchVerification(),
      refetchBooking()
    ]);
  };

  // No reference = invalid URL
  if (!reference) {
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
            Invalid Payment Reference
          </h2>
          <p className="text-gray-600 mb-8">
            No payment reference found. Please try again.
          </p>
          <button
            onClick={() => navigate("/bookings", { replace: true })}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // Still verifying
  if (isLoading) {
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
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your payment...
          </p>
          <p className="text-sm text-gray-500">
            This may take up to 30 seconds
          </p>
        </div>
      </div>
    );
  }

  // Verification failed or payment not successful
  if (isError || verifiedPayment?.status !== 'PAID') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md border border-yellow-100">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Processing...
          </h2>
          <p className="text-gray-600 mb-4">
            Your payment is being confirmed. This may take a moment.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Don't worry, your payment was received by Paystack. We're just waiting for confirmation.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Check Status Again
            </button>
            <button
              onClick={() => navigate("/bookings", { replace: true })}
              className="w-full bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success!
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
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-1">
                {booking.paymentStatus === 'PAID' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    PAID
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Show message if booking status hasn't updated yet */}
        {booking?.paymentStatus !== 'PAID' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              ℹ️ Booking status is updating. You can check the details page in a moment.
            </p>
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
            onClick={handleRefresh}
            className="w-full text-gray-600 px-6 py-3 rounded-xl font-medium hover:text-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}