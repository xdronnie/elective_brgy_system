import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../app/auth/Login";
import RequestForm from "../app/public/request/RequestForm";
import Unauthorized from "../app/Unauthorized";
import StaffDashboard from "../app/dashboard/StaffDashboard";
import ResidentList from "../app/residents/ResidentList";
import ResidentForm from "../app/residents/ResidentForm";
import RequestList from "../app/requests/RequestList";
import RequestDetails from "../app/requests/RequestDetails";
import AuditLogs from "../app/audit/AuditLogs";
import GeneratedDocumentList from "../app/generated/GeneratedDocumentList";
import GeneratedDocumentPreview from "../app/generated/GeneratedDocumentPreview";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Register from "../app/auth/Register";
import RequestStatus from "../app/public/status/RequestStatus";
import EditRequest from "../app/public/status/EditRequest";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequestForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/request/status/:id" element={<RequestStatus />} />
<Route path="/request/edit/:id" element={<EditRequest />} />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["staff"]}>
                <StaffDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}