// Import navigation helper from React Router
import { Navigate } from "react-router-dom";

// Custom authentication hook (provides user state and loading status)
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {

  // Get current authenticated user and loading state
  const { user, loading } = useAuth();

  // =========================
  // LOADING STATE HANDLING
  // =========================
  // While authentication state is still being resolved,
  // prevent rendering protected content to avoid flicker or unauthorized access
  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  // =========================
  // AUTHENTICATION CHECK
  // =========================
  // If no user is logged in, redirect to login page
  // "replace" prevents back navigation to protected route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // =========================
  // AUTHORIZED ACCESS
  // =========================
  // If user exists, allow access to the protected component
  return children;
}