// Import React hooks for lifecycle and state management
import { useEffect, useState } from "react";

// Import navigation utilities from React Router
import { useNavigate, Link } from "react-router-dom";

// Import authentication service functions
import { forgotStaffPassword, loginStaff } from "../../services/authService";

// Custom hook to access authenticated user context
import { useAuth } from "../../hooks/useAuth";

// Import CSS styling
import "./Login.css";

export default function Login() {

  // Get current authenticated user from context
  const { user } = useAuth();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for error handling (login or reset)
  const [submitError, setSubmitError] = useState("");

  // State to indicate loading during login request
  const [loading, setLoading] = useState(false);

  // State for success message after password reset request
  const [resetMessage, setResetMessage] = useState("");

  // Effect: Redirect user if already authenticated
  useEffect(() => {
    if (!user) return; // If no user, stay on login page

    // If user exists, redirect to staff dashboard
    navigate("/staff/dashboard", { replace: true });

  }, [user, navigate]);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload

    setSubmitError(""); // Clear previous errors
    setLoading(true);   // Start loading

    // Call login service with credentials
    const result = await loginStaff(email, password);

    setLoading(false); // Stop loading after response

    // If login failed, show error message
    if (!result?.success) {
      setSubmitError(result?.message || "Failed to login.");
      return;
    }

    // If login successful, redirect to dashboard
    navigate("/staff/dashboard", { replace: true });
  };

  // Handle "Forgot Password" action
  const handleForgotPassword = async () => {

    setSubmitError("");  // Clear previous errors
    setResetMessage(""); // Clear previous success messages

    // Call password reset service
    const result = await forgotStaffPassword(email);

    // If request failed, show error
    if (!result?.success) {
      setSubmitError(result?.message || "Failed to send reset email.");
      return;
    }

    // If successful, show confirmation message
    setResetMessage(result.message);
  };

  return (
    <div className="login-page">

      {/* Card container for login form */}
      <div className="login-card">

        {/* Branding / System title */}
        <div className="login-brand">
          DocuBay: Barangay Document Request System
        </div>

        {/* Page title and description */}
        <h1>Staff Login</h1>
        <p>Login to manage residents, requests, and generated documents.</p>

        {/* Display login error message if exists */}
        {submitError ? (
          <div className="login-error">{submitError}</div>
        ) : null}

        {/* Display reset success message if exists */}
        {resetMessage ? (
          <div className="login-success">{resetMessage}</div>
        ) : null}

        {/* Login form */}
        <form onSubmit={handleLogin} className="login-form">

          {/* Email input field */}
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter staff email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on input
              required
            />
          </div>

          {/* Password input field */}
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update state
              required
            />
          </div>

          {/* Forgot password button (not form submit) */}
          <div className="login-forgot-row">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit button with loading state */}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Navigation link to main public request form */}
        <div className="login-extra-link">
          <Link to="/" className="request-form-link">
            Go to Main Request Form
          </Link>
        </div>

      </div>
    </div>
  );
}