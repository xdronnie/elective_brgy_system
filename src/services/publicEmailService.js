const API_BASE_URL = import.meta.env.VITE_MAILER_API_URL || "";

export const sendRequestEmail = async (payload) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("sendRequestEmail error:", error);
    return {
      success: false,
      message: error.message || "Failed to send email.",
    };
  }
};