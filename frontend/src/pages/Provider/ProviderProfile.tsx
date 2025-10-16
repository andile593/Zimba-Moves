import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Edit,
  Save,
  X,
  Star,
  Users,
  CheckCircle,
  Truck,
  FileText,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import ProviderProfileForm from "../../components/ProviderProfileForm/ProviderProfileForm";
import api from "../../services/axios";
import type { Provider } from "../../types/provider";

export default function ProviderProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>({});

  // Fetch provider profile (which includes user data)
  const { data: profile, isLoading } = useQuery({
    queryKey: ["providerProfile"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      setFormData(res.data);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Provider>) => {
      return api.put(`/providers/${profile.id}`, data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update profile");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => updateMutation.mutate(formData);
  
  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">No Profile Found</h3>
              <p className="text-sm text-yellow-800">
                You need to create a provider profile before accessing this page.
              </p>
            </div>
          </div>
        </div>
        <ProviderProfileForm />
      </div>
    );
  }

  const stats = {
    rating: 4.8,
    reviews: 127,
    bookings: 340,
    vehicles: profile.vehicles?.length || 0,
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <Header
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />

      {/* Profile Header Card */}
      <ProfileHero profile={profile} stats={stats} />

      {/* Profile Information */}
      <ProfileDetails
        profile={profile}
        formData={formData}
        isEditing={isEditing}
        onChange={handleInputChange}
      />

      {/* Tips */}
      <ProfileTips />
    </div>
  );
}

/* --- COMPONENTS BELOW --- */

function Header({ isEditing, onEdit, onCancel, onSave, isSaving }: any) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Provider Profile</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your business information and settings
        </p>
      </div>
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileHero({ profile, stats }: any) {
  const user = profile.user;
  const displayLetter = profile.company?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || "P";

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xl border-4 border-white/30">
          {displayLetter}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Verified Provider</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            {profile.company || `${user?.firstName} ${user?.lastName}`}
          </h2>

          {/* User Contact Info */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-green-100 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {user?.firstName} {user?.lastName}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {user?.phone}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-green-100">
            {(profile.city || profile.region) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.city && <span>{profile.city}</span>}
                {profile.city && profile.region && <span>, </span>}
                {profile.region && <span>{profile.region}</span>}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" /> {stats.vehicles} Vehicles
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
        <StatBadge icon={Star} label="Rating" value={stats.rating.toString()} />
        <StatBadge icon={Users} label="Reviews" value={stats.reviews.toString()} />
        <StatBadge icon={CheckCircle} label="Bookings" value={stats.bookings.toString()} />
        <StatBadge icon={Truck} label="Vehicles" value={stats.vehicles.toString()} />
      </div>
    </div>
  );
}

function ProfileDetails({ profile, formData, isEditing, onChange }: any) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Business Information */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          Business Information
        </h3>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="company"
                value={formData.company || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{profile.company || "Not provided"}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio / Description
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={onChange}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {profile.bio || "No description provided"}
              </p>
            )}
          </div>

          {/* Helpers */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
            {isEditing ? (
              <>
                <input
                  type="checkbox"
                  name="includeHelpers"
                  checked={formData.includeHelpers || false}
                  onChange={onChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm text-gray-700">
                  We provide moving helpers
                </label>
              </>
            ) : (
              <>
                <CheckCircle className={`w-5 h-5 ${profile.includeHelpers ? "text-green-600" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${profile.includeHelpers ? "text-green-800" : "text-gray-600"}`}>
                  {profile.includeHelpers ? "Helpers Available" : "No Helpers Available"}
                </span>
              </>
            )}
          </div>

          {/* Earnings */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-xs text-green-700 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-green-800">
              R{profile.earnings?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Account Information
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <p className="text-gray-800 font-medium">
              {profile.user?.firstName} {profile.user?.lastName}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-gray-800">{profile.user?.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <p className="text-gray-800">{profile.user?.phone}</p>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              {profile.user?.role || "PROVIDER"}
            </span>
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-gray-800">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Location Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800">{profile.address || "Not provided"}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800">{profile.city || "Not provided"}</p>
            )}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region / Province
            </label>
            {isEditing ? (
              <input
                type="text"
                name="region"
                value={formData.region || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800">{profile.region || "Not provided"}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800">{profile.postalCode || "Not provided"}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            {isEditing ? (
              <input
                type="text"
                name="country"
                value={formData.country || ""}
                onChange={onChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="text-gray-800">{profile.country || "South Africa"}</p>
            )}
          </div>

          {/* Coordinates */}
          {(profile.latitude || profile.longitude) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinates
              </label>
              <p className="text-gray-800 text-sm">
                {profile.latitude?.toFixed(6)}, {profile.longitude?.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTips() {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Profile Tips
      </h3>
      <ul className="space-y-2 text-sm text-blue-800">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Keep your profile up to date for better visibility</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Add detailed descriptions to attract more customers</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Upload required documents in the Documents section</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Add vehicles to your fleet to receive more bookings</span>
        </li>
      </ul>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }: any) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-green-100">{label}</p>
    </div>
  );
}