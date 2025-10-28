import {
  CheckCircle,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Star,
  Truck,
  Users,
} from "lucide-react";
import StatBadge from "./StatBadge";
import { Provider } from "@/types";

export default function ProfileHero({
  profile,
  stats,
}: {
  profile: Provider;
  stats: {
    rating: number;
    reviews: number;
    bookings: number;
    vehicles: number;
  };
}) {
  const user = profile.user;
  const displayLetter = user?.firstName?.[0]?.toUpperCase() || "P";

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 text-white">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-bold shadow-xl border-4 border-white/30">
          {displayLetter}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {profile.status === "APPROVED"
                ? "Verified Provider"
                : profile.status}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            {user?.firstName} {user?.lastName}
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-green-100 mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {user?.phone}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-green-100">
            {(profile.city || profile.region) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {profile.city && <span>{profile.city}</span>}
                {profile.city && profile.region && <span>, </span>}
                {profile.region && <span>{profile.region}</span>}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> {stats.vehicles} Vehicles
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
        <StatBadge icon={Star} label="Rating" value={stats.rating.toFixed(1)} />
        <StatBadge
          icon={Users}
          label="Reviews"
          value={stats.reviews.toString()}
        />
        <StatBadge
          icon={CheckCircle}
          label="Bookings"
          value={stats.bookings.toString()}
        />
        <StatBadge
          icon={DollarSign}
          label="Earnings"
          value={`R${(profile.earnings || 0).toFixed(0)}`}
        />
      </div>
    </div>
  );
}
