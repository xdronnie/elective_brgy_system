// Import React hooks for lifecycle and state management
import { useEffect, useState } from "react";

// Import navigation and linking utilities
import { Link, useNavigate } from "react-router-dom";

// Import registration service function
import { registerStaff } from "../../services/authService";

// Custom hook to access authenticated user
import { useAuth } from "../../hooks/useAuth";

// Import shared login/register styles
import "./Login.css";

export default function Register() {

  // Get current authenticated user from context
  const { user } = useAuth();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error message state (validation or backend errors)
  const [submitError, setSubmitError] = useState("");

  // Loading state for async request
  const [loading, setLoading] = useState(false);

  // Effect: Redirect if user is already authenticated
  useEffect(() => {
    if (!user) return;

    // Prevent logged-in users from accessing register page
    navigate("/staff/dashboard", { replace: true });

  }, [user, navigate]);

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page reload

    setSubmitError(""); // Clear previous errors

    // Basic client-side validation: check for empty fields
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setSubmitError("Please fill out all fields.");
      return;
    }

    // Ensure password and confirmation match
    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    // Enforce minimum password length (basic security requirement)
    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true); // Start loading before API call

    // Call registration service with user data
    const result = await registerStaff({
      fullName,
      email,
      password,
    });

    setLoading(false); // Stop loading after response

    // Handle failed registration
    if (!result?.success) {
      setSubmitError(result?.message || "Failed to register.");
      return;
    }

    // Success feedback (basic alert; can be improved to toast UI)
    alert("Staff account registered successfully.");

    // Redirect to dashboard after successful registration
    navigate("/staff/dashboard", { replace: true });
  };

  return (
    <div className="login-page">

      {/* Card container for registration form */}
      <div className="login-card">

        {/* Branding / system name */}
        <div className="login-brand">
          DocuBay: Barangay Document Request System
        </div>

        {/* Page title and description */}
        <h1>Staff Registration</h1>
        <p>Create a staff account to manage residents, requests, and documents.</p>

        {/* Display validation or backend error message */}
        {submitError ? (
          <div className="login-error">{submitError}</div>
        ) : null}

        {/* Registration form */}
        <form onSubmit={handleRegister} className="login-form">

          {/* Full Name input */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} // Update state
              required
            />
          </div>

          {/* Email input */}
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter staff email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state
              required
            />
          </div>

          {/* Password input */}
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

          {/* Confirm Password input */}
          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // Update state
              required
            />
          </div>

          {/* Submit button with loading state */}
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        {/* Navigation link to login page */}
        <div className="login-footer-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>

      </div>
    </div>
  );
}