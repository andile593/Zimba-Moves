import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Package, DollarSign, User, Clock, TrendingUp, Filter } from "lucide-react";
import api from "../../services/axios";

export default function ProviderBookings() {
  const { data, isLoading } = useQuery({
    queryKey: ["providerBookings"],
    queryFn: async () => (await api.get("/providers/me/bookings")).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
          <p className="text-gray-600 mb-6">
            Your bookings will appear here once customers start booking your services.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              💡 <strong>Tip:</strong> Make sure your vehicles are added and your profile is complete to attract more customers!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: data.length,
    pending: data.filter((b: any) => b.status === "PENDING").length,
    confirmed: data.filter((b: any) => b.status === "CONFIRMED").length,
    completed: data.filter((b: any) => b.status === "COMPLETED").length,
    revenue: data.reduce((sum: number, b: any) => sum + (b.pricing?.total || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          My Bookings
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
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
              All Bookings
            </h2>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="divide-y">
          {data.map((booking: any) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
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
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colors: Record<StatCardColor, string> = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function BookingCard({ booking }: any) {
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentColor = (status: string) => {
    return status === "PAID" ? "text-green-600" : "text-yellow-600";
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
              <span className="text-xs text-gray-500">
                #{booking.id?.slice(0, 8)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
              {booking.moveType?.replace(/_/g, " ")}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              R{booking.pricing?.total || 0}
            </p>
            <span className={`text-xs font-medium ${getPaymentColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Pickup</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {booking.pickup}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Dropoff</p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {booking.dropoff}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(booking.dateTime || booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Customer</p>
              <p className="text-sm font-medium text-gray-800">
                {booking.customer?.name || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          <button className="flex-1 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition">
            View Details
          </button>
          {booking.status === "PENDING" && (
            <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}