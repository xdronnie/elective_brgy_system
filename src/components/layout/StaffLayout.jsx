import { Link, useNavigate } from "react-router-dom";
import { logoutStaff } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import "./StaffLayout.css";

export default function StaffLayout({ title, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutStaff();
    navigate("/login", { replace: true });
  };

  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <div>
          <div className="staff-brand">DocuBay</div>
          <div className="staff-role">Staff</div>
        </div>

        <nav className="staff-nav">
          <Link to="/staff/dashboard">Dashboard</Link>
          <Link to="/staff/residents">Residents</Link>
          <Link to="/staff/residents/new">Add Resident</Link>
          <Link to="/staff/requests">Requests</Link>
          <Link to="/staff/generated-documents">Generated Documents</Link>
          <Link to="/staff/audit-logs">Audit Logs</Link>
        </nav>

        <button className="staff-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="staff-main">
        <div className="staff-header">
          <h1>{title}</h1>
          <div className="staff-user">
            {user?.fullName || "Staff User"}
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
}