import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Download,
  Package,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import api from "../../services/axios";
import { useProviderBookings } from "@/hooks/useBooking";
import type { Booking } from "@/types/booking";

export default function Earnings() {
  // Get provider data
  const { data: providerData, isLoading: providerLoading } = useQuery({
    queryKey: ["myProvider"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      return res.data;
    },
  });

  const providerId = providerData?.id;

  // Fetch bookings for earnings calculation
  const { data: bookingsData, isLoading: bookingsLoading } =
    useProviderBookings(providerId);

  // Show loader while fetching data
  const isLoading = providerLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Header Skeleton */}
          <div className="mb-8">
            <div className="h-12 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
          </div>

          {/* Loading Stats Skeleton */}
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl shadow-lg p-8 mb-8 h-64 animate-pulse"></div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 h-40 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate earnings from real bookings data
  const completedBookings =
    bookingsData?.filter((b: Booking) => b.status === "COMPLETED") || [];
  const pendingBookings =
    bookingsData?.filter(
      (b: Booking) => b.status === "CONFIRMED" || b.status === "PENDING"
    ) || [];

  const totalEarnings = completedBookings.reduce(
    (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
    0
  );

  const pendingEarnings = pendingBookings.reduce(
    (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
    0
  );

  // Calculate this month's earnings
  const now = new Date();
  const thisMonthBookings = completedBookings.filter((b: Booking) => {
    const bookingDate = new Date(b.createdAt || b.dateTime);
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });

  const thisMonthEarnings = thisMonthBookings.reduce(
    (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
    0
  );

  // Calculate last month's earnings
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthBookings = completedBookings.filter((b: Booking) => {
    const bookingDate = new Date(b.createdAt || b.dateTime);
    return (
      bookingDate.getMonth() === lastMonth.getMonth() &&
      bookingDate.getFullYear() === lastMonth.getFullYear()
    );
  });

  const lastMonthEarnings = lastMonthBookings.reduce(
    (sum: number, b: Booking) => sum + (b.pricing?.total || 0),
    0
  );

  // Calculate growth percentage
  const growth =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
      ? 100
      : 0;

  // Group completed bookings by month for recent payouts
  const bookingsByMonth = completedBookings.reduce(
    (acc: any, booking: Booking) => {
      const date = new Date(booking.createdAt || booking.dateTime);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          date: date,
          bookings: [],
          total: 0,
        };
      }

      acc[monthKey].bookings.push(booking);
      acc[monthKey].total += booking.pricing?.total || 0;

      return acc;
    },
    {}
  );

  // Convert to array and sort by date
  const recentPayouts = Object.entries(bookingsByMonth)
    .map(([key, value]: [string, any]) => ({
      id: key,
      date: value.date.toISOString(),
      amount: value.total,
      bookings: value.bookings.length,
      status: "Completed",
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Calculate average booking value
  const avgBookingValue =
    completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Earnings Overview
          </h1>
          <p className="text-lg text-gray-600">
            Track your income and payment history
          </p>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-green-100 text-sm mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-2">
                R{totalEarnings.toFixed(2)}
              </h2>
              <div className="flex items-center gap-2 text-green-100">
                {growth >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">
                      +{growth.toFixed(1)}% from last month
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm">
                      {growth.toFixed(1)}% from last month
                    </span>
                  </>
                )}
              </div>
            </div>

            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-sm font-medium backdrop-blur-sm inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-green-100 text-xs mb-1 font-medium">
                This Month
              </p>
              <p className="text-2xl font-bold">
                R{thisMonthEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-green-100 mt-1">
                {thisMonthBookings.length} bookings
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-green-100 text-xs mb-1 font-medium">
                Last Month
              </p>
              <p className="text-2xl font-bold">
                R{lastMonthEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-green-100 mt-1">
                {lastMonthBookings.length} bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Pending Earnings"
            value={`R${pendingEarnings.toFixed(2)}`}
            description={`${pendingBookings.length} bookings`}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={`R${totalEarnings.toFixed(2)}`}
            description={`${completedBookings.length} bookings`}
            color="green"
          />
          <StatCard
            icon={Package}
            title="Avg Per Booking"
            value={`R${avgBookingValue.toFixed(2)}`}
            description="Average earnings"
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Bookings"
            value={bookingsData?.length || 0}
            description="All time"
            color="purple"
          />
        </div>

        {/* Recent Payouts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Payment History
              </h2>
              <span className="text-sm text-gray-500 font-medium">
                {recentPayouts.length} months
              </span>
            </div>
          </div>

          {recentPayouts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No payment history yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Complete bookings to see your earnings here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(payout.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {payout.bookings} bookings
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900">
                            R{payout.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {recentPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        R{payout.amount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        {payout.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(payout.date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{payout.bookings} bookings</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5" />
            Payment Information
          </h3>
          <ul className="space-y-2.5 text-sm text-blue-800">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1 text-lg">•</span>
              <span className="flex-1">
                Earnings are calculated from completed bookings only
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1 text-lg">•</span>
              <span className="flex-1">
                Pending earnings include confirmed and pending bookings
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1 text-lg">•</span>
              <span className="flex-1">
                Platform fees and taxes may be deducted from final payouts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1 text-lg">•</span>
              <span className="flex-1">
                Contact support for payment schedule and withdrawal options
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

type StatCardColor = "yellow" | "green" | "blue" | "purple";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description: string;
  color: StatCardColor;
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  color,
}: StatCardProps) {
  const colors: Record<
    StatCardColor,
    { gradient: string; bg: string; text: string }
  > = {
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
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 bg-gradient-to-br ${colors[color].gradient} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
