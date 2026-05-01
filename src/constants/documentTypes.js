// src/constants/documentTypes.js

// Centralized constant object for all supported document types
// This acts like an ENUM to avoid hardcoding strings across the system
// Helps prevent typos and ensures consistency in document handling logic
export const DOCUMENT_TYPES = {

  // Barangay Clearance document type
  BARANGAY_CLEARANCE: "barangay_clearance",

  // Certificate of Residency document type
  CERTIFICATE_RESIDENCY: "certificate_residency",

  // Certificate of Indigency document type
  CERTIFICATE_INDIGENCY: "certificate_indigency",

  // Good Moral Certificate document type
  CERTIFICATE_GOOD_MORAL: "certificate_good_moral",

  // First-time job seeker certificate document type
  CERTIFICATE_FIRST_TIME_JOB_SEEKER: "certificate_first_time_job_seeker",

  // Business permit / clearance document type
  BUSINESS_PERMIT: "business_permit",
};