import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginStaff } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">DocuBay: Barangay Document Request System</div>
        <h1>Staff Login</h1>
        <p>Login to manage residents, requests, and generated documents.</p>

        {submitError ? <div className="login-error">{submitError}</div> : null}

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

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}