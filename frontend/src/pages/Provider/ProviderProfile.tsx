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
  Calendar,
  User,
  CreditCard,
  Building2,
  Shield,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
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
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => updateMutation.mutate(formData);

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 text-lg mb-2">
                  No Profile Found
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  You need to create a provider profile before accessing this
                  page.
                </p>
                <button
                  onClick={() => navigate("/provider/apply")}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all shadow-lg"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    rating: profile.rating || 4.8,
    reviews: 127,
    bookings: 340,
    vehicles: profile.vehicles?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Profile Sections */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Profile Information */}
          <ProfileInformation
            profile={profile}
            formData={formData}
            isEditing={isEditing}
            onChange={handleInputChange}
          />

          {/* Account Information */}
          <AccountInformation profile={profile} />
        </div>

        {/* Banking Details Section */}
        <BankingDetails
          profile={profile}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
        />

        {/* Location Information */}
        <LocationInformation
          profile={profile}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
        />

        {/* Tips */}
        <ProfileTips />
      </div>
    </div>
  );
}

/* --- COMPONENTS BELOW --- */

function Header({ isEditing, onEdit, onCancel, onSave, isSaving }: any) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          Provider Profile
        </h1>
        <p className="text-lg text-gray-600">
          Manage your profile information and settings
        </p>
      </div>
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Profile</span>
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileHero({ profile, stats }: any) {
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

          {/* User Contact Info */}
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

          {/* Location */}
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

      {/* Stats Grid */}
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

function ProfileInformation({ profile, formData, isEditing, onChange }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-green-600" />
        Profile Information
      </h3>

      <div className="space-y-5">
        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bio / Description
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={onChange}
              rows={4}
              placeholder="Tell customers about yourself and your moving services..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
              {profile.bio || "No description provided"}
            </p>
          )}
        </div>

        {/* ID Number */}
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

        {/* Helpers */}
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

        {/* Earnings */}
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

function AccountInformation({ profile }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-green-600" />
        Account Information
      </h3>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <p className="text-gray-900 font-medium text-lg">
            {profile.user?.firstName} {profile.user?.lastName}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Mail className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800">{profile.user?.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Phone className="w-5 h-5 text-gray-400" />
            <p className="text-gray-800">{profile.user?.phone}</p>
          </div>
        </div>

        {/* Role */}
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
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankingDetails({ profile, formData, isEditing, onChange }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Banking Details</h3>
          <p className="text-sm text-gray-600">For receiving payments</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bank Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="bankName"
              value={formData.bankName || ""}
              onChange={onChange}
              placeholder="e.g., FNB, Standard Bank"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <Building2 className="w-5 h-5 text-gray-400" />
              <p className="text-gray-800">
                {profile.bankName || "Not provided"}
              </p>
            </div>
          )}
        </div>

        {/* Account Holder */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account Holder Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="accountHolder"
              value={formData.accountHolder || ""}
              onChange={onChange}
              placeholder="Full name on account"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <User className="w-5 h-5 text-gray-400" />
              <p className="text-gray-800">
                {profile.accountHolder || "Not provided"}
              </p>
            </div>
          )}
        </div>

        {/* Account Number */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account Number
          </label>
          {isEditing ? (
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber || ""}
              onChange={onChange}
              placeholder="Enter your bank account number"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
            />
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <p className="text-gray-800 font-mono">
                {profile.accountNumber
                  ? `****${profile.accountNumber.slice(-4)}`
                  : "Not provided"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-5 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Your banking information is secure
            </p>
            <p className="text-xs text-blue-700">
              All banking details are encrypted and only used for processing
              payments. We never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationInformation({ profile, formData, isEditing, onChange }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-green-600" />
        Location Information
      </h3>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Address */}
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

        {/* City */}
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

        {/* Region */}
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

        {/* Postal Code */}
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

        {/* Country */}
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

function ProfileTips() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
        <FileText className="w-6 h-6" />
        Profile Tips
      </h3>
      <ul className="space-y-3 text-sm text-blue-800">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Keep your profile up to date for better visibility</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Add a detailed bio to attract more customers</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <span>Complete your banking details to receive payments faster</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
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
        <Icon className="w-5 h-5" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-green-100 font-medium">{label}</p>
    </div>
  );
}
