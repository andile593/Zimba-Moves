import { Calendar, CheckCircle, Mail, Phone, Users } from "lucide-react";
import type { Provider } from "@/types";

interface AccountInformationProps {
  profile: Provider;
}

export default function AccountInformation({
  profile,
}: AccountInformationProps) {
  // Safely format the creation date
  const formatMemberSince = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-green-600" />
        Account Information
      </h3>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <p className="text-gray-900 font-medium text-lg">
            {profile.user?.firstName || ""} {profile.user?.lastName || ""}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Mail className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800">{profile.user?.email || "N/A"}</p>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800">{profile.user?.phone || "N/A"}</p>
          </div>
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account Type
          </label>
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-xl border border-green-200">
            <CheckCircle className="w-4 h-4" />
            {profile.user?.role || "PROVIDER"}
          </span>
        </div>

        {/* Member Since */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Member Since
          </label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800">
              {formatMemberSince(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
