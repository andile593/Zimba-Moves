import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedProviderRouteProps {
  children: React.ReactNode;
}

export default function ProtectedProviderRoute({
  children,
}: ProtectedProviderRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <span className="animate-pulse text-lg">
          Verifying provider access...
        </span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toUpperCase();
  const status = user.providerStatus?.toUpperCase();

  if (role !== "PROVIDER") return <Navigate to="/" replace />;

  switch (status) {
    case "PENDING":
      return <Navigate to="/provider/pending" replace />;
    case "REJECTED":
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Application Rejected
            </h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, your application was not approved. Contact support
              for more info.
            </p>
            <button
              onClick={() => (window.location.href = "/contact")}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md mb-2"
            >
              Contact Support
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    case "APPROVED":
      return <>{children}</>;
    default:
      // Any other undefined state
      return <Navigate to="/provider/apply" replace />;
  }
}
