import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/axios";
import { Loader2, AlertCircle } from "lucide-react";
import ProviderDashboard from "./Dashboard";
import CreateProviderProfile from "../../components/ProviderProfileForm/ProviderProfileForm";

export default function ProviderPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  // Check if user has provider profile - OPTIMIZED QUERY
  const { data: providerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["providerProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Use the dedicated endpoint for current user's profile
        const res = await api.get("/providers/me/profile");
        return res.data || null;
      } catch (err: any) {
        // If 404, user doesn't have a profile yet
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!user?.id && user?.role === "PROVIDER",
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  useEffect(() => {
    // Check if user is not a provider
    if (!authLoading && user && user.role !== "PROVIDER") {
      setShowUnauthorized(true);
    }
  }, [user, authLoading]);

  // Show loading only on initial load
  const isInitialLoading =
    authLoading || (profileLoading && providerProfile === undefined);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access your provider dashboard
          </p>
          <button
            onClick={() => navigate("/login?redirect=/provider")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // User is not a provider
  if (showUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only users with a Provider role can access this page. Your current
            role is: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!providerProfile) {
    navigate("/provider/apply");
    return null;
  }

  // User has provider profile - show dashboard
  return <ProviderDashboard provider={providerProfile} />;
}
