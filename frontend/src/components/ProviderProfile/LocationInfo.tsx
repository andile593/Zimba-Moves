import { MapPin } from "lucide-react";
import { Provider } from "@/types";

export default function LocationInformation({
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
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-green-600" />
        Location Information
      </h3>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Street Address
          </label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={onChange}
              placeholder="123 Main Street"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">
              {profile.address || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City
          </label>
          {isEditing ? (
            <input
              type="text"
              name="city"
              value={formData.city || ""}
              onChange={onChange}
              placeholder="Johannesburg"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">
              {profile.city || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Region / Province
          </label>
          {isEditing ? (
            <input
              type="text"
              name="region"
              value={formData.region || ""}
              onChange={onChange}
              placeholder="Gauteng"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">
              {profile.region || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Postal Code
          </label>
          {isEditing ? (
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode || ""}
              onChange={onChange}
              placeholder="2000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">
              {profile.postalCode || "Not provided"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Country
          </label>
          {isEditing ? (
            <input
              type="text"
              name="country"
              value={formData.country || ""}
              onChange={onChange}
              placeholder="South Africa"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <p className="text-gray-800 bg-gray-50 p-3 rounded-xl">
              {profile.country || "South Africa"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
