// src/utils/referenceNumber.js
export const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REF-${year}-${random}`;
};