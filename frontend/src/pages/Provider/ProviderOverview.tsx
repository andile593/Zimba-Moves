import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { useProviderBookings } from "@/hooks/useBooking";
import type { Booking } from "@/types/booking";

export default function ProviderOverview() {
  // Get providerId from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const providerId = user.providerId;

  const { data: bookingsData, isLoading } = useProviderBookings(providerId);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const bookings = bookingsData || [];

  // Calculate stats
  const stats = {
    activeBookings: bookings.filter((b: Booking) =>
      ["PENDING", "CONFIRMED"].includes(b.status || "")
    ).length,
    totalBookings: bookings.length,
    completedBookings: bookings.filter((b: Booking) => b.status === "COMPLETED")
      .length,
    totalEarnings: bookings
      .filter((b: Booking) => b.paymentStatus === "PAID")
      .reduce((sum: number, b: Booking) => sum + (b.pricing?.total || 0), 0),
  };

  // Calculate this month's earnings
  const now = new Date();
  const thisMonthBookings = bookings.filter((b: Booking) => {
    const bookingDate = new Date(b.createdAt || b.dateTime);
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear() &&
      b.paymentStatus === "PAID"
    );
  });

  const thisMonthEarnings = thisMonthBookings.reduce(
    (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
    0
  );

  // Recent bookings
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.dateTime).getTime() -
        new Date(a.createdAt || a.dateTime).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || "Provider"}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Active Bookings"
          value={stats.activeBookings}
          subtitle={`${stats.totalBookings} total`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completedBookings}
          subtitle="Finished jobs"
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="This Month"
          value={`R${thisMonthEarnings.toFixed(0)}`}
          subtitle={`${thisMonthBookings.length} bookings`}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Earned"
          value={`R${stats.totalEarnings.toFixed(0)}`}
          subtitle="All time"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            to="/provider/vehicles"
            icon={Truck}
            label="Add Vehicle"
            description="Register new vehicle"
            color="green"
          />
          <QuickActionCard
            to="/provider/bookings"
            icon={Package}
            label="View Bookings"
            description={`${stats.activeBookings} active`}
            color="blue"
          />
          <QuickActionCard
            to="/provider/profile"
            icon={Settings}
            label="Update Profile"
            description="Edit business info"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <Link
            to="/provider/bookings"
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your bookings will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle: string;
  color: "blue" | "green" | "purple" | "yellow";
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: StatCardProps) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

interface QuickActionCardProps {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: "green" | "blue" | "purple";
}

function QuickActionCard({
  to,
  icon: Icon,
  label,
  description,
  color,
}: QuickActionCardProps) {
  const colors = {
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
  };

  return (
    <Link
      to={to}
      className={`relative overflow-hidden p-6 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg hover:shadow-xl transition-all group`}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-1">{label}</h3>
        <p className="text-sm text-white/90 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>Get started</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status || ""] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Link
      to={`/provider/bookings/${booking.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="font-semibold text-gray-800">
            {booking.customer?.firstName} {booking.customer?.lastName}
          </p>
          <span
            className={`px-2 py-0.5 text-xs rounded-full border font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="truncate">{booking.pickup}</p>
              <p className="truncate text-gray-500">→ {booking.dropoff}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(
                booking.dateTime || booking.createdAt || ""
              ).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-lg text-green-600">
          R{booking.pricing?.total?.toFixed(2) || "0.00"}
        </p>
        <p className="text-xs text-gray-500">{booking.paymentStatus}</p>
      </div>
    </Link>
  );
}

// Import CheckCircle from lucide-react
import { CheckCircle } from "lucide-react";
