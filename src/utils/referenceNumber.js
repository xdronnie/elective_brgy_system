// src/utils/referenceNumber.js

/**
 * Generates a unique reference number for document requests.
 * Format: REF-YYYY-XXXXXX (where XXXXXX is a random 6-digit number)
 * Example: REF-2026-483921
 */
export const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REF-${year}-${random}`;
};