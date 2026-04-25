import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_SUBMITTED_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_SUBMITTED;
const TEMPLATE_STATUS_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_STATUS;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

function validateEmailConfig() {
  if (!SERVICE_ID || !TEMPLATE_SUBMITTED_ID || !TEMPLATE_STATUS_ID || !PUBLIC_KEY) {
    throw new Error("EmailJS environment variables are missing.");
  }
}

function validateRequiredFields(fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      throw new Error(`Missing required email field: ${key}`);
    }
  }
}

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

export async function sendSubmittedEmail({
  to,
  applicantName,
  referenceNo,
  documentType,
  purpose,
  status = "pending",
  statusUrl = "",
  familyRequestUrl = "",
}) {
  validateRequiredFields({
    to,
    applicantName,
    referenceNo,
    documentType,
    purpose,
  });

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
  validateRequiredFields({
    to,
    applicantName,
    referenceNo,
    documentType,
    status,
  });

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