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
  MapPin,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";

// Mock auth hook - replace with your actual implementation
const useAuth = () => ({
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
});

// API base URL - adjust as needed
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch bookings
        const bookingsRes = await fetch(`${API_URL}/bookings`, { headers });
        if (!bookingsRes.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsRes.status}`);
        }
        const bookingsData = await bookingsRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);

        // Fetch vehicles if provider ID exists
        if (provider?.id) {
          const vehiclesRes = await fetch(
            `${API_URL}/providers/${provider.id}/vehicles`,
            { headers }
          );
          if (!vehiclesRes.ok) {
            throw new Error(`Failed to fetch vehicles: ${vehiclesRes.status}`);
          }
          const vehiclesData = await vehiclesRes.json();
          setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        setBookings([]);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    if (provider?.id) {
      fetchDashboardData();
    }
  }, [provider?.id]);

  const pendingBookingsCount = bookings.filter(b => b.status === 'PENDING').length;

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
      badge: pendingBookingsCount > 0 ? pendingBookingsCount.toString() : undefined,
      match: ["/provider/bookings"]
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

  const totalEarnings = calculateTotalEarnings(bookings);
  const paidBookingsCount = bookings.filter(b => b.paymentStatus === 'PAID').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                {provider?.user?.firstName?.[0]?.toUpperCase() || provider?.user?.email?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base text-gray-800 truncate max-w-[180px]">
                  {provider?.user?.firstName} {provider?.user?.lastName}
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
                {pendingBookingsCount > 0 && (
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
                  {loading ? "..." : `R${totalEarnings.toFixed(0)}`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Bookings</p>
                <p className="text-lg font-bold text-blue-800">
                  {loading ? "..." : bookings.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-700 mb-1">Vehicles</p>
                <p className="text-lg font-bold text-purple-800">
                  {loading ? "..." : vehicles.length}
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
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {provider?.user?.firstName?.[0]?.toUpperCase() || provider?.user?.email?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 truncate text-lg">
                  {provider?.user?.firstName} {provider?.user?.lastName}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  Provider Account
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
                {loading ? "..." : `R${totalEarnings.toFixed(2)}`}
              </p>
              <p className="text-xs text-green-100">
                {paidBookingsCount} paid {paidBookingsCount === 1 ? 'booking' : 'bookings'}
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
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {provider?.user?.firstName?.[0]?.toUpperCase() || provider?.user?.email?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-800 truncate">
                      {provider?.user?.firstName} {provider?.user?.lastName}
                    </h2>
                    <p className="text-xs text-gray-500">Provider Account</p>
                  </div>
                </div>

                {/* Mobile Earnings Card */}
                <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-4 text-white shadow-lg">
                  <p className="text-xs text-green-100 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : `R${totalEarnings.toFixed(2)}`}
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
              bookings={bookings}
              vehicles={vehicles}
              loading={loading}
              error={error}
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

// Helper Functions
function calculateTotalEarnings(bookings: any[]) {
  return bookings
    .filter(booking => booking.paymentStatus === 'PAID')
    .reduce((total, booking) => total + (booking.pricing?.total || 0), 0);
}

function calculateMonthlyEarnings(bookings: any[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.dateTime);
      return booking.paymentStatus === 'PAID' &&
             bookingDate.getMonth() === currentMonth &&
             bookingDate.getFullYear() === currentYear;
    })
    .reduce((total, booking) => total + (booking.pricing?.total || 0), 0);
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-200',
    'IN_PROGRESS': 'bg-purple-100 text-purple-700 border-purple-200',
    'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
    'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    'PAID': 'text-green-600',
    'PENDING': 'text-yellow-600',
    'FAILED': 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
}

// Overview Component
function ProviderOverview({ provider, bookings, vehicles, loading, error }: { 
  provider: any; 
  bookings: any[];
  vehicles: any[];
  loading: boolean;
  error: string | null;
}) {
  const activeBookings = bookings.filter(b => 
    ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
  ).length;
  
  const monthlyEarnings = calculateMonthlyEarnings(bookings);
  const totalEarnings = calculateTotalEarnings(bookings);
  const paidBookingsCount = bookings.filter(b => b.paymentStatus === 'PAID').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          Welcome back, {provider?.user?.firstName || 'Provider'}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={Package}
          label="Active Bookings"
          value={loading ? "..." : activeBookings.toString()}
          change={`${bookings.length} total`}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Truck}
          label="Vehicles"
          value={loading ? "..." : vehicles.length.toString()}
          change={vehicles.length === 1 ? "1 vehicle" : `${vehicles.length} vehicles`}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="This Month"
          value={loading ? "..." : `R${monthlyEarnings.toFixed(0)}`}
          change={`${bookings.filter(b => {
            const bookingDate = new Date(b.dateTime);
            const now = new Date();
            return bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear();
          }).length} bookings`}
          positive={monthlyEarnings > 0}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={BarChart3}
          label="Total Earned"
          value={loading ? "..." : `R${totalEarnings.toFixed(0)}`}
          change={`${paidBookingsCount} paid`}
          positive={paidBookingsCount > 0}
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>
    );
  }

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickActionButton
            to="/provider/vehicles"
            icon={Truck}
            label="Add Vehicle"
            description="Register new vehicle"
            color="green"
          />
          <QuickActionButton
            to="/provider/bookings"
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

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Recent Bookings
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
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No bookings yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Your bookings will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            {bookings.length > 5 && (
              <Link 
                to="/provider/bookings"
                className="block text-center text-sm text-green-600 hover:text-green-700 font-medium pt-2"
              >
                View all {bookings.length} bookings →
              </Link>
            )}
          </div>
        )}
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

function QuickActionButton({ to, icon: Icon, label, description, color }: any) {
  const colors: Record<string, string> = {
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
  };

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-md hover:shadow-lg transition group`}
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

function BookingCard({ booking }: { booking: any }) {
  const statusColor = getStatusColor(booking.status);
  const paymentColor = getPaymentStatusColor(booking.paymentStatus);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="font-semibold text-gray-800">
            {booking.customer?.firstName} {booking.customer?.lastName}
          </p>
          <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColor}`}>
            {booking.status}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="truncate">{booking.pickup?.address || 'Pickup location'}</p>
              <p className="truncate text-gray-500">→ {booking.dropoff?.address || 'Dropoff location'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(booking.dateTime).toLocaleDateString('en-ZA', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })} at {new Date(booking.dateTime).toLocaleTimeString('en-ZA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {booking.vehicle && (
            <p className="text-xs text-gray-500">
              Vehicle: {booking.vehicle.make} {booking.vehicle.model}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:ml-4">
        <div className="text-right">
          <p className="font-bold text-lg text-green-600">
            R{booking.pricing?.total?.toFixed(2) || '0.00'}
          </p>
          <p className={`text-xs font-medium ${paymentColor}`}>
            {booking.paymentStatus || 'PENDING'}
          </p>
        </div>
      </div>
    </div>
  );
}
