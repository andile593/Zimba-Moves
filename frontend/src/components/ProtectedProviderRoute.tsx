import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedProviderRouteProps {
  children: React.ReactNode;
}

export default function ProtectedProviderRoute({ children }: ProtectedProviderRouteProps) {
  const auth = useContext(AuthContext);
  
  // If not authenticated, redirect to login
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }
  
  // If not a provider, redirect to home
  if (auth.user.role !== "PROVIDER") {
    return <Navigate to="/" replace />;
  }
  
  // If provider status is PENDING, redirect to pending page
  if (auth.user.status === "PENDING") {
    return <Navigate to="/provider/pending" replace />;
  }
  
  // If provider status is REJECTED, show rejection message
  if (auth.user.status === "REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Application Rejected
          </h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your provider application was not approved. Please contact support for more information.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = "/contact"}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no provider status or not approved, show access denied
  if (!auth.user.status || auth.user.status !== "APPROVED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be an approved provider to access this area.
          </p>
          <button
            onClick={() => window.location.href = "/provider/apply"}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Apply to Become a Provider
          </button>
        </div>
      </div>
    );
  }
  
  // Provider is approved, render the protected content
  return <>{children}</>;
}