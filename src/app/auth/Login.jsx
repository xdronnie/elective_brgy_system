import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotStaffPassword, loginStaff } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
const [resetMessage, setResetMessage] = useState("");
  useEffect(() => {
    if (!user) return;
    navigate("/staff/dashboard", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);

    const result = await loginStaff(email, password);

    setLoading(false);

    if (!result?.success) {
      setSubmitError(result?.message || "Failed to login.");
      return;
    }

    navigate("/staff/dashboard", { replace: true });
  };
  const handleForgotPassword = async () => {
  setSubmitError("");
  setResetMessage("");

  const result = await forgotStaffPassword(email);

  if (!result?.success) {
    setSubmitError(result?.message || "Failed to send reset email.");
    return;
  }

  setResetMessage(result.message);
};

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">DocuBay: Barangay Document Request System</div>
        <h1>Staff Login</h1>
        <p>Login to manage residents, requests, and generated documents.</p>

        {submitError ? <div className="login-error">{submitError}</div> : null}
{resetMessage ? <div className="login-success">{resetMessage}</div> : null}
        <form onSubmit={handleLogin} className="login-form">
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
<div className="login-forgot-row">
  <button
    type="button"
    className="forgot-password-btn"
    onClick={handleForgotPassword}
  >
    Forgot Password?
  </button>
</div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-extra-link">
          <Link to="/" className="request-form-link">
            Go to Main Request Form
          </Link>
        </div>
      </div>
    </div>
  );
}