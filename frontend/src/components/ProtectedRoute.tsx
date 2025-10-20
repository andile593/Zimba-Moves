import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/enums";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loader while auth state is hydrating
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <span className="animate-pulse text-lg">
          Checking authentication...
        </span>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Normalize role for comparison
  const normalizedRole = user.role?.toUpperCase();

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(normalizedRole as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
