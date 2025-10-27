import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar, 
  ArrowUpRight, 
  Download
} from "lucide-react";
import api from "../../services/axios";

export default function Earnings() {
  const { data, isLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => (await api.get("/providers/me/earnings")).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Earnings Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track your income and payment history
        </p>
      </div>

  // Calculate this month's earnings
  const now = new Date();
  const thisMonthBookings = completedBookings.filter((b: Booking) => {
    const bookingDate = new Date(b.createdAt || b.dateTime);
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });

          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium backdrop-blur-sm">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-green-100 text-xs mb-1">This Month</p>
            <p className="text-2xl font-bold">R{earningsData.thisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-green-100 text-xs mb-1">Last Month</p>
            <p className="text-2xl font-bold">R{earningsData.lastMonth.toFixed(2)}</p>
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
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Recent Payouts
            </h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All
            </button>
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
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5" />
          Payout Information
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Payouts are processed weekly, every Friday</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Pending amounts include bookings awaiting completion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>A 10% platform fee is deducted from each transaction</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

type StatCardColor = "yellow" | "green" | "blue";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: StatCardColor;
}

function StatCard({ icon: Icon, title, value, description, color }: StatCardProps) {
  const colors: Record<StatCardColor, string> = {
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
  };

  const bgColors: Record<StatCardColor, string> = {
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={`${bgColors[color]} border-2 rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}
