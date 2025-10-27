import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign, 
  User, 
  Clock, 
  TrendingUp, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useBookings, useUpdateBooking } from "../../hooks/useBooking";
import toast from "react-hot-toast";
import type { BookingStatus } from "@/types/enums";


type FilterType = "ALL" | BookingStatus;

export default function ProviderBookings() {
  const navigate = useNavigate();
  const { data: bookings, isLoading, error, refetch } = useBookings();
  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Handle booking status update
  const handleStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
    updateBooking(
      { id: bookingId, booking: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Booking ${newStatus.toLowerCase()} successfully!`);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to update booking");
        }
      }
    );
  };

  // Filter bookings
  const filteredBookings = bookings?.filter((booking: any) => {
    if (filter === "ALL") return true;
    return booking.status === filter;
  }) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Bookings</h3>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "An error occurred while loading your bookings."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!bookings || bookings.length === 0) {
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
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === "PENDING").length,
    confirmed: bookings.filter((b: any) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b: any) => b.status === "COMPLETED").length,
    revenue: bookings
      .filter((b: any) => b.paymentStatus === "PAID")
      .reduce((sum: number, b: any) => sum + (b.pricing?.total || 0), 0),
  };

  const filterOptions: { label: string; value: FilterType; count?: number }[] = [
    { label: "All Bookings", value: "ALL", count: stats.total },
    { label: "Pending", value: "PENDING", count: stats.pending },
    { label: "Confirmed", value: "CONFIRMED", count: stats.confirmed },
    { label: "In Progress", value: "PENDING" },
    { label: "Completed", value: "COMPLETED", count: stats.completed },
    { label: "Cancelled", value: "CANCELLED" },
  ];

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
          highlight={stats.pending > 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Confirmed"
          value={stats.confirmed}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`R${stats.revenue.toFixed(0)}`}
          color="purple"
        />
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              {filter === "ALL" ? "All Bookings" : `${filter} Bookings`}
              <span className="text-sm text-gray-500">({filteredBookings.length})</span>
            </h2>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20 overflow-hidden">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between ${
                          filter === option.value ? "bg-green-50 text-green-700 font-semibold" : ""
                        }`}
                      >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            filter === option.value 
                              ? "bg-green-200 text-green-800" 
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {option.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="divide-y">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No {filter.toLowerCase()} bookings found</p>
            </div>
          ) : (
            filteredBookings.map((booking: any) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={() => navigate(`/provider/bookings/${booking.id}`)}
                isUpdating={isUpdating}
              />
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
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, color, highlight }: StatCardProps) {
  const colors: Record<StatCardColor, string> = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition ${
      highlight ? "ring-2 ring-yellow-400 ring-offset-2" : ""
    }`}>
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-gray-600 mb-2 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface BookingCardProps {
  booking: any;
  onStatusUpdate: (bookingId: string, status: BookingStatus) => void;
  onViewDetails: () => void;
  isUpdating: boolean;
}

function BookingCard({ booking, onStatusUpdate, onViewDetails, isUpdating }: BookingCardProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      PENDING: {
        class: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      CONFIRMED: {
        class: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      IN_PROGRESS: {
        class: "bg-blue-100 text-blue-800 border-blue-200",
        icon: TrendingUp,
      },
      COMPLETED: {
        class: "bg-gray-100 text-gray-800 border-gray-200",
        icon: CheckCircle,
      },
      CANCELLED: {
        class: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };
    return configs[status] || configs.PENDING;
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
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition">
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.class} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {booking.status}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                #{booking.id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
              {booking.moveType?.replace(/_/g, " ") || "N/A"}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              R{booking.pricing?.total?.toFixed(2) || "0.00"}
            </p>
            {getPaymentBadge(booking.paymentStatus)}
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 space-y-2 border">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1 font-semibold">PICKUP</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {booking.pickup}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1 font-semibold">DROPOFF</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {booking.dropoff}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(booking.dateTime || booking.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Customer</p>
              <p className="text-sm font-medium text-gray-800">
                {booking.customer?.firstName || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Helpers</p>
              <p className="text-sm font-medium text-gray-800">
                {booking.helpersRequired || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          {booking.status === "PENDING" && (
            <button
              onClick={() => onStatusUpdate(booking.id, "CONFIRMED")}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Accept
            </button>
          )}
          {booking.status === "CONFIRMED" && (
            <button
              onClick={() => onStatusUpdate(booking.id, "PENDING")}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Move
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
