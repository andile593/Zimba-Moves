import { Star, Package, Truck, DollarSign, Calendar } from "lucide-react";
import { Provider } from "@/types";

interface ProfileHeroProps {
  profile: Provider;
  stats: {
    rating: number | null;
    reviews: number;
    bookings: number;
    totalBookings: number;
    vehicles: number;
    totalEarnings: number;
    completedPayouts: number;
  };
  bookingsData?: any[];
  payoutsData?: any[];
}

export default function ProfileHero({ profile, stats, bookingsData, payoutsData }: ProfileHeroProps) {
  // Calculate this month's stats
  const now = new Date();
  const thisMonthBookings = bookingsData?.filter((b: any) => {
    const bookingDate = new Date(b.createdAt || b.dateTime);
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear() &&
      b.status === "COMPLETED"
    );
  }).length || 0;

  const thisMonthPayouts = payoutsData?.filter((p: any) => {
    const payoutDate = new Date(p.createdAt);
    return (
      payoutDate.getMonth() === now.getMonth() &&
      payoutDate.getFullYear() === now.getFullYear() &&
      p.status === "COMPLETED"
    );
  }) || [];

  const thisMonthEarnings = thisMonthPayouts.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );

  // Get pending bookings
  const pendingBookings = bookingsData?.filter(
    (b: any) => b.status === "PENDING" || b.status === "CONFIRMED"
  ).length || 0;

  return (
    <div className="mb-6">
      {/* Status Banner */}
      <div className="mb-6">
        {profile.status === "APPROVED" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 text-lg mb-1">
                  Profile Active
                </h3>
                <p className="text-sm text-green-700">
                  Your profile is approved and visible to customers. Keep your information up to date.
                </p>
              </div>
              <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold shadow-md">
                Active
              </span>
            </div>
          </div>
        )}

        {profile.status === "PENDING" && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 text-lg mb-1">
                  Under Review
                </h3>
                <p className="text-sm text-yellow-700">
                  Your profile is being reviewed by our team. You'll be notified once approved.
                </p>
              </div>
              <span className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-semibold shadow-md">
                Pending
              </span>
            </div>
          </div>
        )}

        {profile.status === "REJECTED" && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg mb-1">
                  Application Rejected
                </h3>
                <p className="text-sm text-red-700 mb-2">
                  {profile.rejectionReason || "Your application did not meet our requirements."}
                </p>
                <p className="text-xs text-red-600">
                  Please contact support for more information.
                </p>
              </div>
              <span className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold shadow-md">
                Rejected
              </span>
            </div>
          </div>
        )}

        {profile.status === "SUSPENDED" && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Account Suspended
                </h3>
                <p className="text-sm text-gray-700">
                  Your account has been temporarily suspended. Contact support for assistance.
                </p>
              </div>
              <span className="px-4 py-2 bg-gray-500 text-white rounded-xl text-sm font-semibold shadow-md">
                Suspended
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          label="Rating"
          value={stats.rating !== null ? `${stats.rating}★` : "No rating"}
          subtext={stats.reviews > 0 ? `${stats.reviews} reviews` : "No reviews yet"}
          color="yellow"
        />
        <StatCard
          icon={Package}
          label="Completed Jobs"
          value={stats.bookings}
          subtext={
            thisMonthBookings > 0 
              ? `${thisMonthBookings} this month` 
              : pendingBookings > 0
              ? `${pendingBookings} pending`
              : `${stats.totalBookings} total`
          }
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={`R${stats.totalEarnings.toFixed(0)}`}
          subtext={
            thisMonthEarnings > 0
              ? `R${thisMonthEarnings.toFixed(0)} this month`
              : `${stats.completedPayouts} payouts`
          }
          color="green"
        />
        <StatCard
          icon={Truck}
          label="Vehicles"
          value={stats.vehicles}
          subtext={stats.vehicles > 0 ? "All active" : "Add vehicles"}
          color="purple"
        />
      </div>
    </div>
  );
}

type StatCardColor = "yellow" | "blue" | "green" | "purple";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext: string;
  color: StatCardColor;
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  const colors: Record<StatCardColor, { gradient: string; bg: string; text: string }> = {
    yellow: {
      gradient: "from-yellow-500 to-yellow-600",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color].gradient} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  );
}