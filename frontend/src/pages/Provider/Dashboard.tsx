import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Package,
  Truck,
  DollarSign,
  BarChart3,
  User,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProviderBookings } from "@/hooks/useBooking";
import type { Booking } from "@/types/booking";

interface ProviderDashboardProps {
  provider: any;
}

type MenuItem = {
  to: string;
  icon: React.ElementType;
  label: string;
  match: string[];
  badge?: string;
};

export default function ProviderDashboard({
  provider,
}: ProviderDashboardProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const providerId = user.providerId;

  const { data: bookingsData, isLoading: bookingsLoading } =
    useProviderBookings(providerId);

  // Calculate pending bookings badge
  const pendingCount =
    bookingsData?.filter((b: Booking) => b.status === "PENDING").length || 0;

  const menuItems: MenuItem[] = [
    {
      to: "/provider",
      icon: BarChart3,
      label: "Overview",
      match: ["/provider"],
    },
    {
      to: "/provider/bookings",
      icon: Package,
      label: "Bookings",
      match: ["/provider/bookings"],
      badge: pendingCount > 0 ? pendingCount.toString() : undefined,
    },
    {
      to: "/provider/vehicles",
      icon: Truck,
      label: "Vehicles",
      match: ["/provider/vehicles"],
    },
    {
      to: "/provider/earnings",
      icon: DollarSign,
      label: "Earnings",
      match: ["/provider/earnings"],
    },
    {
      to: "/provider/profile",
      icon: User,
      label: "Profile",
      match: ["/provider/profile"],
    },
  ];

  // Improved active detection to handle nested routes (was exact only)
  const isActive = (item: MenuItem) => {
    return item.match.some(
      (m) => pathname === m || pathname.startsWith(m + "/")
    );
  };

  const isOverview =
    pathname === "/provider" || pathname === "/provider/overview";

  // Update bookings menu item with real pending count
  const updatedMenuItems = menuItems.map((item) => {
    if (item.to === "/provider/bookings" && pendingCount > 0) {
      return { ...item, badge: pendingCount.toString() };
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                {provider.company?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base text-gray-800 truncate max-w-[180px]">
                  {provider.company}
                </h1>
                <p className="text-xs text-gray-500">Provider Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats - Mobile */}
          {isOverview && !bookingsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <p className="text-xs text-green-700 mb-1 font-medium">
                  Earnings
                </p>
                <p className="text-lg font-bold text-green-800">
                  R{provider.earnings?.toFixed(0) || "0"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1 font-medium">
                  Bookings
                </p>
                <p className="text-lg font-bold text-blue-800">
                  {bookingsData?.length || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                <p className="text-xs text-purple-700 mb-1 font-medium">
                  Rating
                </p>
                <p className="text-lg font-bold text-purple-800">
                  {provider.rating || "4.8"}★
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r min-h-screen sticky top-0 shadow-sm">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                {provider.company?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 truncate text-lg">
                  {provider.company}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {provider.rating || "4.8"} Rating
                </p>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-xs text-green-100 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total Earnings
              </p>
              <p className="text-3xl font-bold mb-1">
                R{provider.earnings?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-green-100">
                {bookingsData?.length || 0} completed bookings
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {updatedMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                    active
                      ? "bg-green-50 text-green-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? "text-green-600" : ""}`}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t space-y-2">
            <Link
              to="/provider/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-11/12 max-w-xs bg-white z-40 shadow-2xl flex flex-col safe-area-inset">
              {/* Mobile Menu Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                    {provider.company?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-800 truncate">
                      {provider.company}
                    </h2>
                    <p className="text-xs text-gray-500">Provider Account</p>
                  </div>
                </div>

                {/* Mobile Earnings Card */}
                <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-4 text-white shadow-lg">
                  <p className="text-xs text-green-100 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    R{provider.earnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {updatedMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t space-y-2">
                <Link
                  to="/provider/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-hidden">
          {isOverview ? (
            <ProviderOverview
              provider={provider}
              bookingsData={bookingsData}
              bookingsLoading={bookingsLoading}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="grid grid-cols-5 gap-1 p-2">
          {updatedMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all relative ${
                  active
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-600 rounded-t-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
}

// Overview Component with Real Data
function ProviderOverview({
  provider,
  bookingsData,
  bookingsLoading,
}: {
  provider: any;
  bookingsData?: Booking[];
  bookingsLoading: boolean;
}) {
  // Calculate real stats from bookings data
  const stats = {
    totalBookings: bookingsData?.length || 0,
    activeBookings:
      bookingsData?.filter(
        (b: Booking) => b.status === "CONFIRMED" || b.status === "PENDING"
      ).length || 0,
    completedBookings:
      bookingsData?.filter((b: Booking) => b.status === "COMPLETED").length ||
      0,
    totalRevenue:
      bookingsData?.reduce(
        (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
        0
      ) || 0,
    thisMonthRevenue:
      bookingsData
        ?.filter((b: Booking) => {
          const bookingDate = new Date(b.createdAt || b.dateTime);
          const now = new Date();
          return (
            bookingDate.getMonth() === now.getMonth() &&
            bookingDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce(
          (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
          0
        ) || 0,
  };

  // Get recent bookings (last 3)
  const recentBookings =
    bookingsData
      ?.slice() // copy before sort
      .sort((a: Booking, b: Booking) => {
        const dateA = new Date(a.createdAt || a.dateTime || 0);
        const dateB = new Date(b.createdAt || b.dateTime || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3) || [];

  // Get upcoming confirmed bookings
  const upcomingBookings =
    bookingsData
      ?.filter(
        (b: Booking) =>
          b.status === "CONFIRMED" && new Date(b.dateTime || 0) > new Date()
      )
      .sort((a: Booking, b: Booking) => {
        const dateA = new Date(a.dateTime || 0);
        const dateB = new Date(b.dateTime || 0);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3) || [];

  if (bookingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Stats Grid - made responsive for xs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Active Bookings"
            value={stats.activeBookings}
            trend={`${stats.totalBookings} total`}
            color="blue"
          />
          <StatCard
            icon={Truck}
            label="Total Vehicles"
            value={provider.vehicles?.length || 0}
            trend="All active"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            label="This Month"
            value={`R${stats.thisMonthRevenue.toFixed(0)}`}
            trend={`R${stats.totalRevenue.toFixed(0)} total`}
            color="green"
          />
          <StatCard
            icon={Star}
            label="Completed"
            value={stats.completedBookings}
            trend={
              provider.rating ? `${provider.rating}★ rating` : "No rating yet"
            }
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              to="/provider/vehicles"
              icon={Truck}
              label="Add Vehicle"
              description="Register new vehicle"
              gradient="from-green-500 to-green-600"
            />
            <QuickActionCard
              to="/provider/bookings"
              icon={Package}
              label="View Bookings"
              description={`${stats.totalBookings} bookings`}
              gradient="from-blue-500 to-blue-600"
            />
            <QuickActionCard
              to="/provider/profile"
              icon={Settings}
              label="Update Profile"
              description="Edit business info"
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Activity
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            {recentBookings.length > 0 ? (
              // keep list scrollable on small screens to avoid pushing layout
              <div className="space-y-4 max-h-[40vh] md:max-h-[50vh] overflow-auto pr-2">
                {recentBookings.map((booking: Booking) => (
                  <ActivityItem
                    key={booking.id}
                    icon={
                      booking.status === "COMPLETED"
                        ? CheckCircle2
                        : booking.status === "CONFIRMED"
                        ? CheckCircle2
                        : Clock
                    }
                    title={`Booking ${
                      booking.status === "COMPLETED"
                        ? "Completed"
                        : booking.status === "CONFIRMED"
                        ? "Confirmed"
                        : "Pending"
                    }`}
                    description={`${booking.pickup?.substring(
                      0,
                      30
                    )}... → ${booking.dropoff?.substring(0, 30)}...`}
                    time={new Date(
                      booking.createdAt || booking.dateTime
                    ).toLocaleString()}
                    color={
                      booking.status === "COMPLETED"
                        ? "green"
                        : booking.status === "CONFIRMED"
                        ? "blue"
                        : "yellow"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Upcoming Schedule
              </h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4 max-h-[40vh] md:max-h-[50vh] overflow-auto pr-2">
                {upcomingBookings.map((booking: Booking) => {
                  const bookingDate = new Date(booking.dateTime || 0);
                  const isToday =
                    bookingDate.toDateString() === new Date().toDateString();
                  const isTomorrow =
                    bookingDate.toDateString() ===
                    new Date(Date.now() + 86400000).toDateString();

                  return (
                    <ScheduleItem
                      key={booking.id}
                      date={
                        isToday
                          ? "Today"
                          : isTomorrow
                          ? "Tomorrow"
                          : bookingDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                      }
                      time={bookingDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      title={booking.moveType?.replace(/_/g, " ") || "Move"}
                      location={`${booking.pickup?.substring(
                        0,
                        20
                      )}... → ${booking.dropoff?.substring(0, 20)}...`}
                      status={booking.status?.toLowerCase() || "pending"}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No upcoming bookings</p>
                <p className="text-gray-400 text-xs mt-1">
                  Confirmed bookings will appear here
                </p>
              </div>
            )}
          </div>
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
          className={`w-14 h-14 bg-gradient-to-br ${colors[color].gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
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
      <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}

function QuickActionCard({
  to,
  icon: Icon,
  label,
  description,
  gradient,
}: any) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
    >
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-1 truncate">{label}</h3>
        <p className="text-sm text-white/80 mb-4 truncate">{description}</p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>Get started</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Link>
  );
}

function ActivityItem({ icon: Icon, title, description, time, color }: any) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div
        className={`w-10 h-10 ${
          colors[color] || colors.green
        } rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 mb-1 truncate">{title}</p>
        <p className="text-sm text-gray-600 truncate">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ date, time, title, location, status }: any) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
      <div className="flex flex-col items-center flex-shrink-0 w-16">
        <span className="text-xs font-semibold text-gray-500 uppercase truncate">
          {date}
        </span>
        <span className="text-lg font-bold text-gray-900">{time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{location}</p>
      </div>
    </div>
  );
}
