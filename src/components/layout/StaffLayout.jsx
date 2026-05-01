// Import routing utilities for navigation and active link styling
import { NavLink, useNavigate } from "react-router-dom";

// Import React hook for local UI state
import { useState } from "react";

// Import logout service function
import { logoutStaff } from "../../services/authService";

// Custom hook to access authenticated user data
import { useAuth } from "../../hooks/useAuth";

// Import icons for UI/UX enhancement
import {
  FaBars,          // Sidebar toggle icon
  FaSignOutAlt,    // Logout icon
  FaUsers,         // Residents icon
  FaClipboardList, // Requests icon
  FaUserPlus,      // Add resident icon
  FaHistory,       // Audit logs icon
} from "react-icons/fa";

import {
  MdDashboard,     // Dashboard icon
  MdLibraryBooks,  // Generated documents icon
} from "react-icons/md";

// Import layout styling
import "./StaffLayout.css";

export default function StaffLayout({ title, children }) {

  // Get current authenticated user
  const { user } = useAuth();

  // Hook for navigation (used after logout)
  const navigate = useNavigate();

  // State to control sidebar visibility (expanded/collapsed)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle logout action
  const handleLogout = async () => {
    try {
      await logoutStaff(); // Call backend logout

      // Clear stored session data (extra safety)
      localStorage.removeItem("staffUser");
      sessionStorage.removeItem("staffUser");

      // Redirect to login page
      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Logout failed:", error);

      // Basic error feedback (can be replaced with toast system)
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div
      // Dynamic class based on sidebar state (used for layout styling)
      className={`staff-shell ${
        sidebarOpen ? "sidebar-open" : "sidebar-collapsed"
      }`}
    >

      {/* Sidebar navigation */}
      <aside className="staff-sidebar">

        {/* Top section: branding + toggle button */}
        <div className="staff-sidebar-top">
          <div>
            {/* Brand name changes when collapsed */}
            <div className="staff-brand">
              {sidebarOpen ? "DocuBay" : "DB"}
            </div>

            {/* Role label (hidden when collapsed) */}
            <div className="staff-role">
              {sidebarOpen ? "Staff" : ""}
            </div>
          </div>

          {/* Sidebar toggle button */}
          <button
            className="staff-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)} // Toggle state
            type="button"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>

        {/* Navigation title (only visible when expanded) */}
        {sidebarOpen && <div className="staff-nav-title">Navigation</div>}

        {/* Navigation links */}
        <nav className="staff-nav">

          {/* Dashboard */}
          <NavLink
            to="/staff/dashboard"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <MdDashboard className="nav-icon" />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          {/* Residents list */}
          <NavLink
            to="/staff/residents"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaUsers className="nav-icon" />
            {sidebarOpen && <span>Residents</span>}
          </NavLink>

          {/* Add new resident */}
          <NavLink
            to="/staff/residents/new"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaUserPlus className="nav-icon" />
            {sidebarOpen && <span>Add Resident</span>}
          </NavLink>

          {/* Requests */}
          <NavLink
            to="/staff/requests"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaClipboardList className="nav-icon" />
            {sidebarOpen && <span>Requests</span>}
          </NavLink>

          {/* Generated Documents */}
          <NavLink
            to="/staff/generated-documents"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <MdLibraryBooks className="nav-icon" />
            {sidebarOpen && <span>Generated Documents</span>}
          </NavLink>

          {/* Audit Logs */}
          <NavLink
            to="/staff/audit-logs"
            className={({ isActive }) =>
              `staff-nav-link ${isActive ? "active" : ""}`
            }
          >
            <FaHistory className="nav-icon" />
            {sidebarOpen && <span>Audit Logs</span>}
          </NavLink>

        </nav>
      </aside>

      {/* Main content area */}
      <main className="staff-main">

        {/* Header section */}
        <div className="staff-header">

          {/* Page title (passed as prop) */}
          <h1>{title}</h1>

          {/* User info + logout */}
          <div className="staff-user-box">

            {/* Display logged-in user's name */}
            <div className="staff-user">
              {user?.fullName || "Staff User"}
            </div>

            {/* Logout button */}
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

        {/* Render child components (dynamic page content) */}
        <div>{children}</div>

      </main>
    </div>
  );
}