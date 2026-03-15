// src/utils/validators.js
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^09\d{9}$/.test(phone);
};

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

export const validateRequestForm = (form) => {
  const errors = {};

  if (!form.documentType?.trim()) errors.documentType = "Document type is required.";
  if (!form.purpose?.trim()) errors.purpose = "Purpose is required.";

  return errors;
};