import {
  Calendar,
  MapPin,
  Package,
  DollarSign,
  User,
  Clock,
  TrendingUp,
  Filter,
  Search,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useProviderBookings } from "@/hooks/useBooking";
import { useNavigate } from "react-router-dom";
import type { Booking } from "@/types/booking";
import type { BookingStatus } from "@/types/enums";
import { JSX, useState } from "react";

export default function ProviderBookings() {
  // Get providerId from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const providerId = user.providerId;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL"
  );

  const { data, isLoading } = useProviderBookings(providerId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading your bookings...
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-lg px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            No Bookings Yet
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Your bookings will appear here once customers start booking your
            services.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
            <p className="text-green-900 font-medium">
              💡 <strong>Pro Tip:</strong> Make sure your vehicles are added and
              your profile is complete to attract more customers!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: data.length,
    pending: data.filter((b: Booking) => b.status === "PENDING").length,
    confirmed: data.filter((b: Booking) => b.status === "CONFIRMED").length,
    completed: data.filter((b: Booking) => b.status === "COMPLETED").length,
    revenue: data.reduce(
      (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
      0
    ),
  };

  // Filter bookings
  const filteredData = data.filter((booking: Booking) => {
    const matchesSearch =
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.pickup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.dropoff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${booking.customer?.firstName} ${booking.customer?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-lg text-gray-600">
            Manage and track all your booking requests
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Bookings"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="yellow"
            trend="+12%"
          />
          <StatCard
            icon={TrendingUp}
            label="Confirmed"
            value={stats.confirmed}
            color="green"
            trend="+8%"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue"
            value={`R${stats.revenue.toFixed(0)}`}
            color="purple"
            trend="+15%"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, location, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as BookingStatus | "ALL")
                }
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px]"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredData.length}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{data.length}</span>{" "}
          bookings
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No bookings match your search criteria
              </p>
            </div>
          ) : (
            filteredData.map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type StatCardColor = "blue" | "yellow" | "green" | "purple";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: StatCardColor;
  trend?: string;
}

function StatCard({ icon: Icon, label, value, color, trend }: StatCardProps) {
  const colors: Record<
    StatCardColor,
    { gradient: string; bg: string; text: string }
  > = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    yellow: {
      gradient: "from-yellow-500 to-yellow-600",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 bg-gradient-to-br ${colors[color].gradient} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[color].bg} ${colors[color].text}`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
}

function BookingCard({ booking }: BookingCardProps) {
  const navigate = useNavigate();

  const getStatusConfig = (status?: BookingStatus) => {
    if (!status)
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Clock className="w-4 h-4" />,
      };

    const configs: Record<BookingStatus, { color: string; icon: JSX.Element }> =
      {
        PENDING: {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: <Clock className="w-4 h-4" />,
        },
        CONFIRMED: {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: <CheckCircle2 className="w-4 h-4" />,
        },
        COMPLETED: {
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: <CheckCircle2 className="w-4 h-4" />,
        },
        CANCELLED: {
          color: "bg-red-100 text-red-800 border-red-300",
          icon: <XCircle className="w-4 h-4" />,
        },
      };
    return (
      configs[status] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Clock className="w-4 h-4" />,
      }
    );
  };

  const getPaymentBadge = (status?: string) => {
    if (status === "PAID") {
      return (
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
          PAID
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
        {status || "PENDING"}
      </span>
    );
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 inline-flex items-center gap-2 ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {booking.status}
              </span>
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                #{booking.id?.slice(0, 8)}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
              {booking.moveType?.replace(/_/g, " ") || "N/A"}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900 mb-2">
              R{booking.pricing?.total || 0}
            </p>
            {getPaymentBadge(booking.paymentStatus)}
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wide">
                  Pickup
                </p>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {booking.pickup}
                </p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-gray-300 ml-4 h-4"></div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wide">
                  Dropoff
                </p>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {booking.dropoff}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 font-medium mb-1">Date</p>
            <p className="text-sm font-bold text-blue-900">
              {booking.dateTime
                ? new Date(booking.dateTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <User className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 font-medium mb-1">Customer</p>
            <p className="text-sm font-bold text-purple-900 truncate">
              {booking.customer?.firstName && booking.customer?.lastName
                ? `${booking.customer.firstName.charAt(0)}. ${
                    booking.customer.lastName
                  }`
                : "N/A"}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <Package className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 font-medium mb-1">Helpers</p>
            <p className="text-sm font-bold text-orange-900">
              {booking.helpersRequired || 0}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/provider/bookings/${booking.id}`)}
            className="flex-1 px-5 py-3 text-sm font-semibold text-green-600 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all inline-flex items-center justify-center gap-2 group"
          >
            View Details
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          {booking.status === "PENDING" && (
            <button
              onClick={() => navigate(`/provider/bookings/${booking.id}`)}
              className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </button>
          )}
          {booking.status === "CONFIRMED" && (
            <div className="flex-1 px-5 py-3 text-sm font-semibold text-center text-green-700 bg-green-100 rounded-xl border-2 border-green-200 inline-flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Confirmed
            </div>
          )}
          {booking.status === "CANCELLED" && (
            <div className="flex-1 px-5 py-3 text-sm font-semibold text-center text-red-700 bg-red-100 rounded-xl border-2 border-red-200 inline-flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
