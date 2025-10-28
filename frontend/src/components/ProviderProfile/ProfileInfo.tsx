import { CheckCircle, DollarSign, Shield, User } from "lucide-react";
import { Provider } from "@/types";

export default function ProfileInformation({
  profile,
  formData,
  isEditing,
  onChange,
}: {
  profile: Provider;
  formData: Partial<Provider>;
  isEditing: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  console.log(profile);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-green-600" />
        Profile Information
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ID Number
          </label>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800 font-mono">
              {profile.idNumber || "Not provided"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
          {isEditing ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="includeHelpers"
                checked={formData.includeHelpers || false}
                onChange={onChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-semibold text-gray-800">
                I provide moving helpers
              </span>
            </label>
          ) : (
            <div className="flex items-center gap-3">
              <CheckCircle
                className={`w-6 h-6 ${
                  profile.includeHelpers ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  profile.includeHelpers ? "text-green-800" : "text-gray-600"
                }`}
              >
                {profile.includeHelpers
                  ? "Helpers Available"
                  : "No Helpers Available"}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <p className="text-sm font-medium text-green-100">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold">
            R{profile.earnings?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
