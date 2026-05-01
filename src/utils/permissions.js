// src/utils/permissions.js

import { ROLES } from "../constants/roles";


// =====================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// =====================================


// Checks if user is allowed to approve document requests
// Only ADMIN has approval authority
export const canApproveRequest = (user) => {
  return user?.role === ROLES.ADMIN;
};


// Checks if user can encode/create or update requests
// Both ADMIN and ENCODER roles are allowed
export const canEncodeRequest = (user) => {
  return (
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.ENCODER
  );
};


// Restricts access to system settings management
// Only ADMIN has configuration privileges
export const canManageSettings = (user) => {
  return user?.role === ROLES.ADMIN;
};


// Restricts access to audit logs (sensitive system data)
// Only ADMIN can view system-wide logs
export const canViewAuditLogs = (user) => {
  return user?.role === ROLES.ADMIN;
};