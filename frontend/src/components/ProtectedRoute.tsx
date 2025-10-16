import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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

  // Show loading only if we're actively checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <span className="animate-pulse text-lg">Checking authentication...</span>
      </div>
    );
  }

  // If no user, redirect to login with return URL
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}