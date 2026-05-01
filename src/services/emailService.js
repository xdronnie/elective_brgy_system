// EmailJS SDK (client-side email sending service)
import emailjs from "@emailjs/browser";


// ==============================
// ENVIRONMENT VARIABLES
// ==============================

// These are stored in .env file to avoid exposing sensitive configuration in codebase
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_SUBMITTED_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_SUBMITTED;
const TEMPLATE_STATUS_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_STATUS;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


// ==============================
// CONFIG VALIDATION
// ==============================

// Ensures EmailJS is properly configured before sending emails
function validateEmailConfig() {
  if (!SERVICE_ID || !TEMPLATE_SUBMITTED_ID || !TEMPLATE_STATUS_ID || !PUBLIC_KEY) {
    throw new Error("EmailJS environment variables are missing.");
  }
}


// ==============================
// GENERIC FIELD VALIDATION
// ==============================

// Ensures required email fields are not empty
function validateRequiredFields(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      throw new Error(`Missing required email field: ${key}`);
    }
  }
}


// ==============================
// CORE EMAIL SENDING FUNCTION
// ==============================

// Abstraction layer over EmailJS SDK
// Prevents duplication and centralizes error handling
async function sendEmail(templateId, templateParams) {
  validateEmailConfig();

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      templateId,
      templateParams,
      {
        publicKey: PUBLIC_KEY,
      }
    );

    return response;

  } catch (error) {
    console.error("EmailJS send error:", error);

    throw new Error(error?.text || "Failed to send email.");
  }
}


// ==============================
// SUBMISSION EMAIL NOTIFICATION
// ==============================

// Sent when a user submits a document request
export async function sendSubmittedEmail({
  to,              // recipient email
  applicantName,   // name of applicant
  referenceNo,     // tracking ID
  documentType,    // type of request
  purpose,         // reason for request
  status = "pending",
  statusUrl = "",
  familyRequestUrl = "",
}) {

  // Validate required inputs before sending email
  validateRequiredFields({
    to,
    applicantName,
    referenceNo,
    documentType,
    purpose,
  });

  // Send using EmailJS submission template
  return sendEmail(TEMPLATE_SUBMITTED_ID, {
    to_email: to,
    applicant_name: applicantName,
    reference_no: referenceNo,
    document_type: documentType,
    purpose,
    status,
    status_url: statusUrl,
    family_request_url: familyRequestUrl,
  });
}


// ==============================
// STATUS UPDATE EMAIL
// ==============================

// Sent when request status changes (approved, rejected, etc.)
export async function sendStatusUpdateEmail({
  to,
  applicantName,
  referenceNo,
  documentType,
  status,
  rejectionReason = "",
  statusUrl = "",
  familyRequestUrl = "",
}) {

  // Ensure required fields exist before sending
  validateRequiredFields({
    to,
    applicantName,
    referenceNo,
    documentType,
    status,
  });

  // Send using status update template
  return sendEmail(TEMPLATE_STATUS_ID, {
    to_email: to,
    applicant_name: applicantName,
    reference_no: referenceNo,
    document_type: documentType,
    status,
    rejection_reason: rejectionReason,
    status_url: statusUrl,
    family_request_url: familyRequestUrl,
  });
}