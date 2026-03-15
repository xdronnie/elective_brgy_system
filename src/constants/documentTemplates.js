// src/constants/documentTemplates.js

export const DOCUMENT_TEMPLATE_TYPES = {
  BARANGAY_BUSINESS_CLEARANCE: "barangay_business_clearance",
  BARANGAY_CLEARANCE: "barangay_clearance",
  FIRST_TIME_JOBSEEKER: "first_time_jobseeker",
  GOOD_MORAL: "good_moral",
  CERTIFICATE_OF_INDIGENCY: "certificate_of_indigency",
  CERTIFICATE_OF_RESIDENCY: "certificate_of_residency",
};

export const DOCUMENT_TEMPLATES = {
  [DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE]: {
    type: DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE,
    label: "Barangay Business Clearance",
    templateFile: "BGRY-BUSINESS-CLEARANCE.docx",
    collectionKey: "barangay_business_clearance",
    requiredFields: [
      "fullName",
      "businessName",
      "businessAddress",
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
      "preparedBy",
      "approvedBy",
    ],
    filename: ({ referenceNo, fullName }) =>
      `${referenceNo || "DOC"}_BARANGAY_BUSINESS_CLEARANCE_${sanitizeFileName(fullName) || "APPLICANT"}.pdf`,
  },

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

export const getDocumentTemplate = (documentType) => {
  return DOCUMENT_TEMPLATES[documentType] || null;
};

function sanitizeFileName(value = "") {
  return String(value)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();
}