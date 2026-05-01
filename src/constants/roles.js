// src/constants/roles.js

// Centralized role definitions for Role-Based Access Control (RBAC)
// Ensures consistent role usage across authentication, routing, and UI rendering
export const ROLES = {

  // Admin role: has full access to the system
  // Typically manages approvals, users, reports, and system settings
  ADMIN: "admin",

  // Encoder role: responsible for encoding and preparing requests
  // Limited access compared to admin; focuses on data entry and request creation
  ENCODER: "encoder",
};