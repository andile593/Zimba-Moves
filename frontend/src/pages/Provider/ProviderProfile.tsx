import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/axios";
import PaymentCardsSection from "@/components/Banking/PaymentCards";
import Header from "@/components/ProviderProfile/Header";
import LocationInformation from "@/components/ProviderProfile/LocationInfo";
import ProfileTips from "@/components/ProviderProfile/ProfileTips";
import AccountInformation from "@/components/AccountInfo/AccountInfo";
import ProfileInformation from "@/components/ProviderProfile/ProfileInfo";
import ProfileHero from "@/components/ProviderProfile/ProfileHero";
import { Provider } from "@/types";
import axios from "axios";

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message: string;
}

export default function ProviderProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>({});
  const [showAddCard, setShowAddCard] = useState(false);

  // Fetch provider profile
  const { data: profile, isLoading: profileLoading } = useQuery<Provider>({
    queryKey: ["providerProfile"],
    queryFn: async () => {
      const res = await api.get("/providers/me/profile");
      setFormData(res.data);
      return res.data;
    },
  });

  // Fetch real bookings for stats
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["providerBookings", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/providers/${profile.id}/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    },
    enabled: !!profile?.id,
  });

  // Fetch real payouts for earnings stats
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ["providerPayouts", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/providers/${profile.id}/payment-cards/payouts`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    },
    enabled: !!profile?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Provider>) => {
      return api.put(`/providers/${profile?.id}`, data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerProfile"] });
      setIsEditing(false);
    },
    onError: (err: ApiError) => {
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

  const handleSave = () => {
    if (formData) {
      updateMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const isLoading = profileLoading || bookingsLoading || payoutsLoading;

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
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
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

  // Calculate REAL stats
  const completedBookings = bookingsData?.filter(
    (b: any) => b.status === "COMPLETED"
  ) || [];

  const completedPayouts = payoutsData?.filter(
    (p: any) => p.status === "COMPLETED"
  ) || [];

  const totalEarnings = completedPayouts.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );

  // Calculate real average rating from completed bookings with reviews
  // (You'll need to add a reviews/ratings system for this to work properly)
  // For now, we'll use the provider.rating if it exists, otherwise show "No rating"
  
  const stats = {
    rating: profile.rating || null,
    reviews: 0, // TODO: Implement reviews system
    bookings: completedBookings.length,
    totalBookings: bookingsData?.length || 0,
    vehicles: profile.vehicles?.length || 0,
    totalEarnings: totalEarnings,
    completedPayouts: completedPayouts.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          isSaving={updateMutation.isPending}
        />

        <ProfileHero 
          profile={profile} 
          stats={stats}
          bookingsData={bookingsData}
          payoutsData={payoutsData}
        />

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ProfileInformation
            profile={profile}
            formData={formData}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <AccountInformation profile={profile} />
        </div>

        <PaymentCardsSection
          profile={profile}
          showAddCard={showAddCard}
          setShowAddCard={setShowAddCard}
        />

        <LocationInformation
          profile={profile}
          formData={formData}
          isEditing={isEditing}
          onChange={handleInputChange}
        />

        <ProfileTips />
      </div>
    </div>
  );
}