import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutStaff } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import {
  FaBars,
  FaSignOutAlt,
  FaUsers,
  FaClipboardList,
  FaUserPlus,
  FaHistory,
} from "react-icons/fa";
import { MdDashboard, MdLibraryBooks } from "react-icons/md";

import "./StaffLayout.css";

export default function StaffLayout({ title, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logoutStaff();
      localStorage.removeItem("staffUser");
      sessionStorage.removeItem("staffUser");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div
      className={`staff-shell ${
        sidebarOpen ? "sidebar-open" : "sidebar-collapsed"
      }`}
    >
      <aside className="staff-sidebar">
        <div className="staff-sidebar-top">
          <div>
            <div className="staff-brand">{sidebarOpen ? "DocuBay" : "DB"}</div>
            <div className="staff-role">{sidebarOpen ? "Staff" : ""}</div>
          </div>

          <button
            className="staff-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            type="button"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>
{sidebarOpen && <div className="staff-nav-title">Navigation</div>}
 <nav className="staff-nav">
  <NavLink
    to="/staff/dashboard"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <MdDashboard className="nav-icon" />
    {sidebarOpen && <span>Dashboard</span>}
  </NavLink>

  <NavLink
    to="/staff/residents"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <FaUsers className="nav-icon" />
    {sidebarOpen && <span>Residents</span>}
  </NavLink>

  <NavLink
    to="/staff/residents/new"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <FaUserPlus className="nav-icon" />
    {sidebarOpen && <span>Add Resident</span>}
  </NavLink>

  <NavLink
    to="/staff/requests"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <FaClipboardList className="nav-icon" />
    {sidebarOpen && <span>Requests</span>}
  </NavLink>

  <NavLink
    to="/staff/generated-documents"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <MdLibraryBooks className="nav-icon" />
    {sidebarOpen && <span>Generated Documents</span>}
  </NavLink>

  <NavLink
    to="/staff/audit-logs"
    className={({ isActive }) => `staff-nav-link ${isActive ? "active" : ""}`}
  >
    <FaHistory className="nav-icon" />
    {sidebarOpen && <span>Audit Logs</span>}
  </NavLink>
</nav>

     
      </aside>

      <main className="staff-main">
      <div className="staff-header">
  <h1>{title}</h1>

  <div className="staff-user-box">
    <div className="staff-user">{user?.fullName || "Staff User"}</div>

    <button
      type="button"
      className="staff-header-logout"
      onClick={handleLogout}
    >
      <FaSignOutAlt />
      <span>Logout</span>
    </button>
  </div>
</div>

        <div>{children}</div>
      </main>
    </div>
  );
}