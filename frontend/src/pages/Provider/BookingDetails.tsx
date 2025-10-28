import { useState } from "react";
import {
  Calendar,
  MapPin,
  Package,
  DollarSign,
  User,
  Clock,
  Phone,
  Mail,
  Truck,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  Navigation,
  Home,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking, useUpdateBooking } from "@/hooks/useBooking";
import type { BookingStatus } from "@/types/enums";

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Early return if no id
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-800 font-medium">Booking ID is required</p>
        </div>
      </div>
    );
  }

  const { data: booking, isLoading } = useBooking(id);
  const updateBooking = useUpdateBooking();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!booking) return;

    setIsProcessing(true);
    try {
      await updateBooking.mutateAsync({
        id: id,
        booking: { status },
      });
      // Optionally navigate back after a delay
      setTimeout(() => {
        navigate("/provider/bookings");
      }, 2000);
    } catch (error) {
      console.error("Failed to update booking status:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading booking details...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Booking not found</h3>
            <p className="text-red-600 text-sm">
              The booking you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status?: BookingStatus) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

    const colors: Record<BookingStatus, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status?: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getMoveTypeIcon = (moveType?: string) => {
    switch (moveType) {
      case "APARTMENT":
        return <Home className="w-6 h-6" />;
      case "OFFICE":
        return <Building2 className="w-6 h-6" />;
      case "SINGLE_ITEM":
        return <Package className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const isPending = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";
  const isCompleted = booking.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/provider/bookings")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 group transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Bookings</span>
          </button>

          {/* Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">ID: #{id.slice(0, 12)}</p>
            </div>
            <div
              className={`px-6 py-3 text-base font-semibold rounded-2xl border-2 inline-flex items-center gap-2 w-fit ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              {booking.status}
            </div>
          </div>

          {/* Status Alert */}
          {isPending && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800">
                    Action Required
                  </p>
                  <p className="text-sm text-yellow-700">
                    This booking is awaiting your response. Please review and
                    accept or reject.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isConfirmed && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">
                    Booking Confirmed
                  </p>
                  <p className="text-sm text-green-700">
                    You have accepted this booking. Once you've completed the
                    move, mark it as complete below.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">Move Completed</p>
                  <p className="text-sm text-blue-700">
                    This booking has been successfully completed. Payment
                    processing is in progress.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isCancelled && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">
                    Booking Cancelled
                  </p>
                  <p className="text-sm text-red-700">
                    This booking has been cancelled and is no longer active.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    {getMoveTypeIcon(booking.moveType)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {booking.moveType?.replace(/_/g, " ") || "N/A"}
                    </h2>
                    <p className="text-green-100 text-sm">Move Type</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-600 font-medium">
                        Date & Time
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {booking.dateTime
                        ? new Date(booking.dateTime).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.dateTime
                        ? new Date(booking.dateTime).toLocaleTimeString()
                        : ""}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-600 font-medium">
                        Helpers
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {booking.helpersRequired || 0}
                    </p>
                    <p className="text-sm text-gray-600">Required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Information Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Route Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Pickup and delivery locations
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative pl-8 pb-8 border-l-2 border-dashed border-green-300">
                  <div className="absolute left-0 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                      Pickup Location
                    </p>
                    <p className="font-medium text-gray-900">
                      {booking.pickup}
                    </p>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                      Dropoff Location
                    </p>
                    <p className="font-medium text-gray-900">
                      {booking.dropoff}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            {booking.vehicle && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Vehicle Information
                    </h2>
                    <p className="text-sm text-gray-600">
                      Assigned vehicle details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      Vehicle
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.vehicle.year}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      Plate Number
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.vehicle.plate}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      Type
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.vehicle.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      Capacity
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.vehicle.capacity}m³
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Customer</h2>
                  <p className="text-sm text-gray-600">Contact information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-700 font-medium mb-2">
                    Full Name
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Email</p>
                  </div>
                  <p className="font-medium text-gray-900 break-all">
                    {booking.customer?.email}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Phone</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {booking.customer?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-3xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Pricing Details</h2>
                  <p className="text-green-100 text-sm">Breakdown</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-green-100">Base Rate</span>
                  <span className="font-semibold text-lg">
                    R{booking.pricing?.baseRate || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-green-100">
                    Distance ({booking.pricing?.distance || 0} km)
                  </span>
                  <span className="font-semibold text-lg">
                    R{booking.pricing?.distanceCost || 0}
                  </span>
                </div>
                {booking.pricing?.helpersCost > 0 && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-green-100">Helpers</span>
                    <span className="font-semibold text-lg">
                      R{booking.pricing?.helpersCost || 0}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-xl font-bold">Total Amount</span>
                  <span className="text-3xl font-bold">
                    R{booking.pricing?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-green-100">Payment Status</span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      booking.paymentStatus === "PAID"
                        ? "bg-white/20 text-white"
                        : "bg-yellow-400/20 text-yellow-100"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isPending && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate("CONFIRMED")}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isProcessing ? "Processing..." : "Accept Booking"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-red-200 text-red-600 font-semibold rounded-2xl hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    {isProcessing ? "Processing..." : "Reject Booking"}
                  </button>
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Complete Move
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you've successfully completed the move and delivered all
                  items, mark this booking as complete.
                </p>
                <button
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isProcessing ? "Processing..." : "Mark as Complete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
