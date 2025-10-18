import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";
import ProviderDashboard from "./Dashboard";

export default function ProviderPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== "PROVIDER") {
      setShowUnauthorized(true);
    }
  }, [user, authLoading]);

  if (authLoading) {
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

  // Check provider status from user object
  if (user.providerStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Application Pending
          </h2>
          <p className="text-gray-600 mb-6">
            Your provider application is currently under review. We'll notify
            you once it's approved.
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

  if (user.providerStatus === "REJECTED") {
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
          <p className="text-sm text-gray-600 mb-6">
            You can contact our support team for more information.
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

  if (user.providerStatus === "SUSPENDED") {
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
            Your provider account has been temporarily suspended. Please contact
            support for more information.
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
  // Pass user object with providerId to dashboard
  return <ProviderDashboard provider={{ id: user.providerId, ...user }} />;
}
