import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/axios";
import { Loader2, AlertCircle } from "lucide-react";
import ProviderDashboard from "./Dashboard";
import PendingApproval from "./PendingApproval";

export default function ProviderPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  // Check if user has provider profile
  const { data: providerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["providerProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const res = await api.get("/providers/me/profile");
        return res.data || null;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!user?.id && user?.role === "PROVIDER",
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!authLoading && user && user.role !== "PROVIDER") {
      setShowUnauthorized(true);
    }
  }, [user, authLoading]);

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

  // No provider profile found - redirect to application
  if (!providerProfile) {
    navigate("/provider/apply");
    return null;
  }

  // Provider profile exists but not approved yet
  if (providerProfile.status === "PENDING") {
    return <PendingApproval />;
  }

  // Provider profile rejected
  if (providerProfile.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Application Rejected
          </h2>
          <p className="text-gray-600 mb-4">
            Unfortunately, your provider application was not approved.
          </p>
          {providerProfile.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-red-800 mb-1">Reason:</p>
              <p className="text-sm text-red-700">{providerProfile.rejectionReason}</p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-6">
            You can contact our support team for more information or reapply with updated information.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Provider profile suspended
  if (providerProfile.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Account Suspended
          </h2>
          <p className="text-gray-600 mb-6">
            Your provider account has been temporarily suspended. Please contact support for more information.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Provider approved - show dashboard
  return <ProviderDashboard provider={providerProfile} />;
}