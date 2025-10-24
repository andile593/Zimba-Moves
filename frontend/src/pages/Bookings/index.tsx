// BookingHistory.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../../hooks/useBooking";
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation
} from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-gray-700 font-medium">Loading your bookings...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md border border-red-100">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">We couldn't load your bookings. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transition-all shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md border border-green-100">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Package className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Bookings Yet</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Start your moving journey today! Book professional movers with just a few taps.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Book Your First Move
          </button>
        </div>
      </div>
    );
  }

  const completedCount = bookings.filter((b: any) => b.status === "COMPLETED").length;
  const confirmedCount = bookings.filter((b: any) => b.status === "CONFIRMED").length;
  const pendingCount = bookings.filter((b: any) => b.status === "PENDING").length;
  const cancelledCount = bookings.filter((b: any) => b.status === "CANCELLED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white px-4 py-8 shadow-2xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-green-100 text-sm">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} • Track your moves
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={CheckCircle}
            count={completedCount}
            label="Completed"
            gradient="from-green-500 to-emerald-600"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Clock}
            count={confirmedCount}
            label="Confirmed"
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={AlertCircle}
            count={pendingCount}
            label="Pending"
            gradient="from-yellow-500 to-orange-500"
            bgColor="bg-yellow-50"
            iconColor="text-yellow-600"
          />
          <StatCard
            icon={XCircle}
            count={cancelledCount}
            label="Cancelled"
            gradient="from-red-500 to-red-600"
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <FilterChip label="All" count={bookings.length} active />
          <FilterChip label="Active" count={confirmedCount + pendingCount} />
          <FilterChip label="Completed" count={completedCount} />
          <FilterChip label="Cancelled" count={cancelledCount} />
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((b: any) => (
              <EnhancedBookingCard key={b.id} booking={b} onClick={() => navigate(`/bookings/${b.id}`)} />
            ))}
        </div>

        {/* Floating New Booking Button */}
        <button
          onClick={() => navigate("/quote-request")}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-5 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] sticky bottom-4"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <span>Book Another Move</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, count, label, gradient, bgColor, iconColor }: any) {
  return (
    <div className={`${bgColor} rounded-2xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-all`}>
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-2xl font-bold ${iconColor} mb-1`}>{count}</div>
      <div className="text-xs text-gray-600 font-medium">{label}</div>
    </div>
  );
}

// Filter Chip Component
function FilterChip({ label, count, active }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );
}

// Enhanced Booking Card Component
function EnhancedBookingCard({ booking, onClick }: any) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      COMPLETED: {
        color: "bg-green-500",
        badge: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      },
      CONFIRMED: {
        color: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      },
      PENDING: {
        color: "bg-yellow-500",
        badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: AlertCircle,
      },
      CANCELLED: {
        color: "bg-red-500",
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl active:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Status Bar with Animation */}
      <div className={`h-1.5 ${statusConfig.color} relative overflow-hidden`}>
        {booking.status === "CONFIRMED" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base capitalize leading-tight">
                  {booking.moveType?.toLowerCase().replace('_', ' ')}
                </h2>
                <div className="text-xs text-gray-500 font-mono">
                  #{booking.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusConfig.badge} flex items-center gap-1.5`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {booking.status}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Route with Enhanced Design */}
        <div className="space-y-3 mb-4 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-gradient-to-b from-green-400 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                PICKUP
              </div>
              <div className="text-sm text-gray-900 font-medium line-clamp-2">{booking.pickup}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                DROPOFF
              </div>
              <div className="text-sm text-gray-900 font-medium line-clamp-2">{booking.dropoff}</div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">
                {new Date(booking.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium">{booking.helpersRequired || 0}</span>
            </div>
          </div>
          <div className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
            booking.paymentStatus === "PAID" ? "bg-green-50 text-green-700" :
            booking.paymentStatus === "REFUNDED" ? "bg-yellow-50 text-yellow-700" :
            booking.paymentStatus === "FAILED" ? "bg-red-50 text-red-700" :
            "bg-gray-50 text-gray-700"
          }`}>
            {booking.paymentStatus}
          </div>
        </div>
      </div>
    </div>
  );
}

