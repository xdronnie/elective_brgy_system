// src/constants/requestStatus.js

// Centralized status constants for document request lifecycle
// This ensures all modules use consistent status values
// Prevents hardcoded strings and reduces bugs from typos
export const REQUEST_STATUS = {

  // Initial state when a request is still being created/edited
  DRAFT: "draft",

  // Request has been submitted and is waiting for review/approval
  FOR_APPROVAL: "for_approval",

  // Request has been reviewed and approved by authorized staff/admin
  APPROVED: "approved",

  // Document is already generated and ready for pickup
  READY_FOR_PICKUP: "ready_for_pickup",

  // Document has been released to the requester
  RELEASED: "released",

  // Request has been denied or rejected
  REJECTED: "rejected",
};