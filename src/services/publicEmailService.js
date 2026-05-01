// Base URL for external mailer API (configured via environment variables)
// This allows switching between local, staging, or production mail services
const API_BASE_URL = import.meta.env.VITE_MAILER_API_URL || "";


// ==============================
// EMAIL SENDING VIA EXTERNAL API
// ==============================

// Sends email request to an external backend mailer service
// This decouples email sending from frontend logic
export const sendRequestEmail = async (payload) => {
  try {

    // HTTP request to mailer API endpoint
    const response = await fetch(API_BASE_URL, {
      method: "POST",

      // JSON payload ensures structured data transfer
      headers: {
        "Content-Type": "application/json",
      },

      // Email content (recipient, subject, template data, etc.)
      body: JSON.stringify(payload),
    });

    // Parse API response (expected to return success/failure status)
    return await response.json();

  } catch (error) {

    // Error handling for network or request failures
    console.error("sendRequestEmail error:", error);

    return {
      success: false,
      message: error.message || "Failed to send email.",
    };
  }
};