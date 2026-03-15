export const sendRequestEmail = async ({
  to,
  type,
  applicantName,
  referenceNo,
  documentType,
  purpose,
  status,
  rejectionReason = "",
}) => {
  try {
    const response = await fetch("http://localhost:3001/send-request-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        type,
        applicantName,
        referenceNo,
        documentType,
        purpose,
        status,
        rejectionReason,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("sendRequestEmail error:", error);
    return {
      success: false,
      message: error.message || "Failed to send email.",
    };
  }
};