// Import routing system from React Router
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Public and authentication pages
import Login from "../app/auth/Login";
import Register from "../app/auth/Register";
import Unauthorized from "../app/Unauthorized";

// Public request-related pages (no authentication required)
import RequestForm from "../app/public/request/RequestForm";
import RequestStatus from "../app/public/status/RequestStatus";
import EditRequest from "../app/public/status/EditRequest";

// Staff dashboard and modules
import StaffDashboard from "../app/dashboard/StaffDashboard";
import ResidentList from "../app/residents/ResidentList";
import ResidentForm from "../app/residents/ResidentForm";
import RequestList from "../app/requests/RequestList";
import RequestDetails from "../app/requests/RequestDetails";

// Generated documents module
import GeneratedDocumentList from "../app/generated/GeneratedDocumentList";
import GeneratedDocumentPreview from "../app/generated/GeneratedDocumentPreview";

// Audit logs module
import AuditLogs from "../app/audit/AuditLogs";

// Route guards (authentication + role-based access control)
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRouter() {

  return (
    <BrowserRouter>

      {/* Application route definitions */}
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        {/* Public document request form (no login required) */}
        <Route path="/" element={<RequestForm />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Unauthorized access page (role mismatch or blocked access) */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public request tracking & editing */}
        <Route path="/request/status/:id" element={<RequestStatus />} />
        <Route path="/request/edit/:id" element={<EditRequest />} />

        {/* =========================
            PROTECTED STAFF ROUTES
        ========================= */}

        {/* Dashboard */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute>
              {/* Ensures user is authenticated */}
              <RoleRoute allowedRoles={["staff"]}>
                {/* Ensures user has correct role */}
                <StaffDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Resident Management */}
        <Route
          path="/staff/residents"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <ResidentList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/residents/new"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <ResidentForm />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Request Management */}
        <Route
          path="/staff/requests"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <RequestList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/requests/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <RequestDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Generated Documents */}
        <Route
          path="/staff/generated-documents"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <GeneratedDocumentList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/generated-documents/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <GeneratedDocumentPreview />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="/staff/audit-logs"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <AuditLogs />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* =========================
            FALLBACK ROUTE
        ========================= */}

        {/* Redirect unknown routes to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}