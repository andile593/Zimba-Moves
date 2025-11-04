import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "../../hooks/useBooking";
import {
  Loader2,
  ArrowLeft,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect } from "react";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch booking data
  const { data: booking, isLoading, error, refetch } = useBooking(id || "");

  // Poll for updates when payment is pending
  useEffect(() => {
    if (booking?.paymentStatus === "PENDING") {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [booking?.paymentStatus, refetch]);

  // Helper function to get provider name
  const getProviderName = () => {
    if (booking?.provider?.user) {
      return `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;
    }
    return "N/A";
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      PAID: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Loader2 },
      FAILED: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
      REFUNDED: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: RefreshCw,
      },
    };
    return configs[status] || configs.PENDING;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">Failed to load booking details.</p>
          <button
            onClick={() => navigate("/bookings")}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const paymentConfig = getPaymentStatusBadge(
    booking.paymentStatus || "PENDING"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pb-6">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold mb-1">Booking Details</h1>
          <p className="text-green-100 text-sm">
            ID: {booking.id ? booking.id.slice(0, 12) : "N/A"}...
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        {/* Payment Status Alert - Show if payment is successful */}
        {booking.paymentStatus === "PAID" && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Payment Confirmed!</h3>
              <p className="text-green-50 text-sm">
                Your booking is confirmed and payment has been processed
                successfully.
              </p>
            </div>
          </div>
        )}

        {/* Payment Pending Alert */}
        {booking.paymentStatus === "PENDING" && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Payment Pending</h3>
              <p className="text-yellow-50 text-sm">
                Complete your payment to confirm this booking.
              </p>
            </div>
            <button
              onClick={() => navigate(`/checkout?bookingId=${booking.id}`)}
              className="px-6 py-3 bg-white text-yellow-600 rounded-xl font-semibold hover:bg-yellow-50 transition shadow-lg"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Status</h2>
            <span
              className={`text-sm font-semibold px-4 py-2 rounded-full ${
                booking.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "CONFIRMED"
                  ? "bg-blue-100 text-blue-700"
                  : booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(booking.dateTime).toLocaleDateString()} at{" "}
              {new Date(booking.dateTime).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Route Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Route Details
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  Pickup Location
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {booking.pickup}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  Dropoff Location
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {booking.dropoff}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & Provider Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-600" />
            Vehicle & Provider
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Vehicle ID</span>
              <span className="text-sm font-medium text-gray-900 font-mono">
                {booking.vehicleId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Provider</span>
              <span className="text-sm font-semibold text-gray-900">
                {getProviderName()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${paymentConfig.bg} ${paymentConfig.text}`}
              >
                {(() => {
                  const Icon = paymentConfig.icon;
                  return (
                    <Icon
                      className={`w-4 h-4 ${
                        booking.paymentStatus === "PENDING"
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                  );
                })()}
                {booking.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-lg font-bold text-green-600">
                {booking.pricing?.total
                  ? `R${booking.pricing.total.toFixed(2)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Helpers Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Helper Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Required</span>
              <span className="text-sm font-semibold text-gray-900">
                {booking.helpersRequired ?? 0} helper
                {booking.helpersRequired !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Provided by</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">
                {booking.helpersProvidedBy?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {booking.paymentStatus !== "PAID" && (
            <button
              onClick={() => navigate(`/checkout?bookingId=${booking.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </button>
          )}

          <button
            onClick={() =>
              navigate("/complaint", {
                state: {
                  bookingId: booking.id,
                  vehicleId: booking.vehicleId,
                },
              })
            }
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-red-700 active:bg-red-800 transition shadow-lg"
          >
            <AlertCircle className="w-5 h-5" />
            Report a Problem
          </button>

          {booking.paymentStatus === "PAID" && (
            <button
              onClick={() => navigate(`/payments/${booking.id}/refund`)}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-yellow-600 active:bg-yellow-700 transition shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              Request Refund
            </button>
          )}

          <button
            onClick={() => refetch()}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
