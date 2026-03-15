// src/utils/permissions.js
import { ROLES } from "../constants/roles";

export const canApproveRequest = (user) => {
  return user?.role === ROLES.ADMIN;
};

export const canEncodeRequest = (user) => {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.ENCODER;
};

export const canManageSettings = (user) => {
  return user?.role === ROLES.ADMIN;
};

export const canViewAuditLogs = (user) => {
  return user?.role === ROLES.ADMIN;
};