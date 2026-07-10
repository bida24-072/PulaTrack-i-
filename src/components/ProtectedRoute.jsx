import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLock } from "@/contexts/AppLockContext";
import Loader from "@/components/Loader";

// Wrap any page that requires the user to be BOTH logged in AND past the
// app-lock PIN screen. Redirects to /login if not authenticated, or to
// /lock if authenticated but the PIN hasn't been entered this session.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { hasPin, unlocked } = useAppLock();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (hasPin && !unlocked) {
    return <Navigate to="/lock" state={{ from: location }} replace />;
  }

  return children;
}
