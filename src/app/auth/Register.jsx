import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStaff } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate("/staff/dashboard", { replace: true });
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setSubmitError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const result = await registerStaff({
      fullName,
      email,
      password,
    });

    setLoading(false);

    if (!result?.success) {
      setSubmitError(result?.message || "Failed to register.");
      return;
    }

    alert("Staff account registered successfully.");
    navigate("/staff/dashboard", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">DocuBay: Barangay Document Request System</div>
        <h1>Staff Registration</h1>
        <p>Create a staff account to manage residents, requests, and documents.</p>

        {submitError ? <div className="login-error">{submitError}</div> : null}

        <form onSubmit={handleRegister} className="login-form">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter staff email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="login-footer-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}