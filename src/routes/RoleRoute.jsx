// Import navigation utility for redirection
import { Navigate } from "react-router-dom";

// Custom hook to access authenticated user data
import { useAuth } from "../hooks/useAuth";

export default function RoleRoute({ allowedRoles = [], children }) {

  // Get current authenticated user from context
  const { user } = useAuth();

  // =========================
  // AUTHENTICATION CHECK
  // =========================
  // If no user exists, redirect to login page
  // This ensures only authenticated users proceed to role validation
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // =========================
  // AUTHORIZATION CHECK (RBAC)
  // =========================
  // Validate if the user's role is included in allowed roles
  // If not authorized, redirect to unauthorized access page
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // =========================
  // ACCESS GRANTED
  // =========================
  // If both authentication and authorization pass,
  // render the protected component
  return children;
}