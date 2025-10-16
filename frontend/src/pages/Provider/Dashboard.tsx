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
  Star
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface ProviderDashboardProps {
  provider: any;
}

export default function ProviderDashboard({ provider }: ProviderDashboardProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      to: "/provider",
      icon: BarChart3,
      label: "Overview",
      match: ["/provider"]
    },
    {
      to: "/provider/bookings",
      icon: Package,
      label: "Bookings",
      badge: "3",
      match: ["/provider/bookings"]
    },
    {
      to: "/provider/vehicles",
      icon: Truck,
      label: "Vehicles",
      match: ["/provider/vehicles"]
    },
    {
      to: "/provider/earnings",
      icon: DollarSign,
      label: "Earnings",
      match: ["/provider/earnings"]
    },
    {
      to: "/provider/profile",
      icon: User,
      label: "Profile",
      match: ["/provider/profile"]
    },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    return item.match.includes(pathname);
  };

  const isOverview = pathname === "/provider" || pathname === "/provider/overview";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                {provider.company?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <h1 className="font-bold text-base text-gray-800 truncate max-w-[180px]">
                  {provider.company}
                </h1>
                <p className="text-xs text-gray-500">Provider Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
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
          {isOverview && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700 mb-1">Earnings</p>
                <p className="text-lg font-bold text-green-800">
                  R{provider.earnings?.toFixed(0) || "0"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Bookings</p>
                <p className="text-lg font-bold text-blue-800">12</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-700 mb-1">Rating</p>
                <p className="text-lg font-bold text-purple-800">4.8★</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white border-r min-h-screen sticky top-0">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {provider.company?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 truncate text-lg">
                  {provider.company}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  4.8 Rating
                </p>
              </div>
            </div>
            
            {/* Earnings Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white shadow-lg">
              <p className="text-xs text-green-100 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total Earnings
              </p>
              <p className="text-3xl font-bold mb-1">
                R{provider.earnings?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-green-100">+15% this month</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition group relative ${
                    active
                      ? "bg-green-50 text-green-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-green-600" : ""}`} />
                  <span className="flex-1">{item.label}</span>
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
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
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-40 shadow-2xl flex flex-col">
              {/* Mobile Menu Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
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
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white shadow-lg">
                  <p className="text-xs text-green-100 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    R{provider.earnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        active
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
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
        <main className="flex-1 min-h-screen">
          {isOverview ? (
            <ProviderOverview provider={provider} />
          ) : (
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="grid grid-cols-5 gap-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition relative ${
                  active
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
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

// Overview Component with Mobile-First Design
function ProviderOverview({ provider }: { provider: any }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          Welcome back!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={Package}
          label="Active Bookings"
          value="12"
          change="+3 this week"
          positive
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Truck}
          label="Vehicles"
          value={provider.vehicles?.length || "0"}
          change="All active"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="This Month"
          value={`R${Math.floor(Math.random() * 5000) + 2000}`}
          change="+15%"
          positive
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={BarChart3}
          label="Rating"
          value="4.8"
          change="45 reviews"
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Quick Actions - Mobile First */}
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
            label="View Bookings"
            description="Manage bookings"
            color="blue"
          />
          <QuickActionButton
            to="/provider/profile"
            icon={Settings}
            label="Update Profile"
            description="Edit business info"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-gray-400 text-xs mt-1">
            Your booking updates will appear here
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive, gradient }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className={`text-xs ${positive ? "text-green-600" : "text-gray-500"}`}>
        {change}
      </p>
    </div>
  );
}

function QuickActionButton({ to, icon: Icon, label, description, color }: any) {
  const colors = {
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
  };

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br text-white shadow-md hover:shadow-lg transition group`}
    >
      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-0.5 text-sm sm:text-base">
          {label}
        </h3>
        <p className="text-xs text-white/80">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" />
    </Link>
  );
}