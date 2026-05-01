// src/utils/validators.js

/**
 * Checks if an email address is in valid format.
 * Uses basic RFC-like pattern validation.
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates Philippine mobile numbers.
 * Accepts format: 09XXXXXXXXX (11 digits total)
 */
export const isValidPhone = (phone) => {
  return /^09\d{9}$/.test(phone);
};

/**
 * Validates resident registration/update form.
 * Returns an object containing field-specific error messages.
 *
 * @param {Object} form - Resident form data
 * @returns {Object} errors - key-value pairs of validation errors
 */
export const validateResidentForm = (form) => {
  const errors = {};

  if (!form.firstName?.trim()) errors.firstName = "First name is required.";
  if (!form.lastName?.trim()) errors.lastName = "Last name is required.";
  if (!form.fullAddress?.trim()) errors.fullAddress = "Address is required.";

  if (!form.contactNumber?.trim()) {
    errors.contactNumber = "Contact number is required.";
  } else if (!isValidPhone(form.contactNumber)) {
    errors.contactNumber = "Invalid Philippine mobile number.";
  }

  if (form.email && !isValidEmail(form.email)) {
    errors.email = "Invalid email address.";
  }

  return errors;
};

/**
 * Validates document request form submission.
 *
 * @param {Object} form - Request form data
 * @returns {Object} errors - validation error messages
 */
export const validateRequestForm = (form) => {
  const errors = {};

  if (!form.documentType?.trim()) {
    errors.documentType = "Document type is required.";
  }

  if (!form.purpose?.trim()) {
    errors.purpose = "Purpose is required.";
  }

  return errors;
};