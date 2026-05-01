// ==============================
// DOCUMENT TYPE CONSTANTS
// ==============================

// Centralized enum-like object for all supported document types
// This avoids hardcoding strings across the system and reduces typos
export const DOCUMENT_TEMPLATE_TYPES = {
  BARANGAY_BUSINESS_CLEARANCE: "barangay_business_clearance",
  BARANGAY_CLEARANCE: "barangay_clearance",
  FIRST_TIME_JOBSEEKER: "first_time_jobseeker",
  GOOD_MORAL: "good_moral",
  CERTIFICATE_OF_INDIGENCY: "certificate_of_indigency",
  CERTIFICATE_OF_RESIDENCY: "certificate_of_residency",
};


// ==============================
// DOCUMENT TEMPLATE CONFIGURATION
// ==============================

// Main configuration registry for all document templates
// Each entry defines:
// - metadata (label, type)
// - file template source
// - Firestore collection mapping
// - required/optional fields
// - filename generation logic
export const DOCUMENT_TEMPLATES = {

  // ============================
  // BUSINESS CLEARANCE
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE]: {
    type: DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE,
    label: "Barangay Business Clearance",

    // DOCX template file used for generation
    templateFile: "BGRY-BUSINESS-CLEARANCE.docx",

    // Firestore collection key for this document type
    collectionKey: "barangay_business_clearance",

    // Fields required to generate a valid document
    requiredFields: [
      "fullName",
      "businessName",
      "businessAddress",
      "purpose",
      "issueDay",
      "issueMonth",
      "issueYear",
    ],

    // Optional metadata fields (can be null without breaking generation)
    optionalFields: [
      "resCertNo",
      "issuedOn",
      "issuedAt",
      "feesPaid",
      "orNo",
      "orDate",
      "preparedBy",
      "approvedBy",
    ],

    // Filename generator function
    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_BARANGAY_BUSINESS_CLEARANCE_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },


  // ============================
  // BARANGAY CLEARANCE
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.BARANGAY_CLEARANCE]: {
    type: DOCUMENT_TEMPLATE_TYPES.BARANGAY_CLEARANCE,
    label: "Barangay Clearance",
    templateFile: "BRGY-CLEARANCE-FOR-BUSINESS.docx",
    collectionKey: "barangay_clearance",

    requiredFields: [
      "fullName",
      "civilStatus",
      "age",
      "citizenship",
      "addressLine",
      "purpose",
      "issueDay",
      "issueMonth",
      "issueYear",
    ],

    optionalFields: [
      "resCertNo",
      "issuedOn",
      "issuedAt",
      "feesPaid",
      "orNo",
      "orDate",
      "approvedBy",
    ],

    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_BARANGAY_CLEARANCE_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },


  // ============================
  // FIRST TIME JOBSEEKER
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.FIRST_TIME_JOBSEEKER]: {
    type: DOCUMENT_TEMPLATE_TYPES.FIRST_TIME_JOBSEEKER,
    label: "First Time Jobseeker Certificate",
    templateFile: "first-joob-seeker.docx",
    collectionKey: "first_time_jobseeker",

    requiredFields: [
      "fullName",
      "civilStatus",
      "addressLine",
      "issueDateText",
    ],

    optionalFields: [
      "sexTitle",
      "approvedBy",
      "witnessedBy",
      "witnessDateText",
    ],

    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_FIRST_TIME_JOBSEEKER_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },


  // ============================
  // GOOD MORAL
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.GOOD_MORAL]: {
    type: DOCUMENT_TEMPLATE_TYPES.GOOD_MORAL,
    label: "Good Moral Certificate",
    templateFile: "Good-Moral.docx",
    collectionKey: "good_moral",

    requiredFields: [
      "fullName",
      "ageLabel",
      "civilStatus",
      "addressLine",
      "purpose",
      "issueDay",
      "issueMonth",
      "issueYear",
    ],

    optionalFields: [
      "approvedBy",
    ],

    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_GOOD_MORAL_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },


  // ============================
  // CERTIFICATE OF INDIGENCY
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_INDIGENCY]: {
    type: DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_INDIGENCY,
    label: "Certificate of Indigency",
    templateFile: "indigeNCY-cert.docx",
    collectionKey: "certificate_of_indigency",

    requiredFields: [
      "fullName",
      "civilStatus",
      "addressLine",
      "purpose",
      "issueDay",
      "issueMonth",
      "issueYear",
    ],

    optionalFields: [
      "approvedBy",
      "familyNameReference",
    ],

    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_CERTIFICATE_OF_INDIGENCY_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },


  // ============================
  // CERTIFICATE OF RESIDENCY
  // ============================
  [DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_RESIDENCY]: {
    type: DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_RESIDENCY,
    label: "Certificate of Residency",
    templateFile: "RESIDENCE-CERTIFICATION.docx",
    collectionKey: "certificate_of_residency",

    requiredFields: [
      "fullName",
      "civilStatus",
      "addressLine",
      "purpose",
      "issueDay",
      "issueMonth",
      "issueYear",
    ],

    optionalFields: [
      "resCertNo",
      "issuedOn",
      "issuedAt",
      "feesPaid",
      "orNo",
      "orDate",
      "approvedBy",
    ],

    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_CERTIFICATE_OF_RESIDENCY_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },
};


// ==============================
// HELPER FUNCTIONS
// ==============================

// Utility function to safely retrieve a template by type
// Returns null if the type does not exist (prevents runtime errors)
export const getDocumentTemplate = (documentType) => {
  return DOCUMENT_TEMPLATES[documentType] || null;
};


// ==============================
// FILE NAME SANITIZER
// ==============================

// Ensures filenames are safe for file systems and consistent formatting
function sanitizeFileName(value = "") {
  return String(value)
    .trim()                          // Remove leading/trailing spaces
    .replace(/\s+/g, "_")           // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_-]/g, "") // Remove special characters
    .toUpperCase();                 // Standardize to uppercase
}