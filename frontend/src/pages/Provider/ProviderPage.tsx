import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Loader2,
  AlertCircle,
  Clock,
  XCircle,
  AlertOctagon,
} from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Login Required
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Please log in to access your provider dashboard
          </p>
          <button
            onClick={() => navigate("/login?redirect=/provider")}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (showUnauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-2 text-lg">
            Only users with a Provider role can access this page.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Your current role is:{" "}
            <strong className="text-gray-700">{user.role}</strong>
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Application Pending
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your provider application is currently under review. We'll notify
            you once it's approved.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800 text-sm font-medium">
              ⏱️ Review typically takes 1-2 business days
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (user.providerStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Application Rejected
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            Unfortunately, your provider application was not approved.
          </p>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-800 text-sm font-medium">
              💬 You can contact our support team for more information or to
              reapply.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold py-4 rounded-xl transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
            <AlertOctagon className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Account Suspended
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your provider account has been temporarily suspended. Please contact
            support for more information.
          </p>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-8">
            <p className="text-orange-800 text-sm font-medium">
              ⚠️ This suspension may be due to policy violations or pending
              verification.
            </p>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Provider approved - show dashboard with proper data structure
  return <ProviderDashboard provider={{ ...user, id: user.providerId }} />;
}
