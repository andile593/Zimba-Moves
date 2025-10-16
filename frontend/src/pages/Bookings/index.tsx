import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../../hooks/useBooking";
import { Loader2, Calendar, MapPin, Users, ChevronRight, Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function BookingHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, isLoading, error, refetch } = useBookings();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">Failed to load your bookings.</p>
          <button
            onClick={() => refetch()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
          <p className="text-gray-600 mb-8">Ready to book your first move?</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition shadow-lg"
          >
            Book Your First Move
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">My Bookings</h1>
          <p className="text-green-100 text-sm">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b: any) => b.status === "COMPLETED").length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter((b: any) => b.status === "CONFIRMED").length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b: any) => b.status === "PENDING").length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md active:shadow-lg transition cursor-pointer"
            >
              {/* Status Bar */}
              <div className={`h-2 ${
                b.status === "COMPLETED" ? "bg-green-500" :
                b.status === "CONFIRMED" ? "bg-blue-500" :
                b.status === "CANCELLED" ? "bg-red-500" :
                "bg-yellow-500"
              }`} />

              <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <h2 className="font-bold text-gray-900 text-lg capitalize">
                        {b.moveType?.toLowerCase().replace('_', ' ')}
                      </h2>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {b.id.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      b.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      b.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {b.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Pickup</div>
                      <div className="text-sm text-gray-900 font-medium truncate">{b.pickup}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Dropoff</div>
                      <div className="text-sm text-gray-900 font-medium truncate">{b.dropoff}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(b.dateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {b.helpersRequired || 0} helpers
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    b.paymentStatus === "PAID" ? "text-green-600" :
                    b.paymentStatus === "REFUNDED" ? "text-yellow-600" :
                    b.paymentStatus === "FAILED" ? "text-red-600" :
                    "text-gray-600"
                  }`}>
                    {b.paymentStatus}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Booking Button */}
        <button
          onClick={() => navigate("/quote-request")}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition shadow-lg flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Book Another Move
        </button>
      </div>
    </div>
  );
}
