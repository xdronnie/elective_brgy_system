export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.FRONTEND_URL || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed." }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    try {
      const body = await request.json();

      const {
        to,
        type,
        applicantName,
        referenceNo,
        documentType,
        purpose,
        status,
        rejectionReason = "",
      } = body;

      if (!to || !type) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing recipient or type." }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      let subject = "DocuBay Notification";
      let html = "";

      if (type === "submitted") {
        subject = `DocuBay Request Received - ${referenceNo || "-"}`;
        html = `
          <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
            <h2>DocuBay Request Received</h2>
            <p>Hello <strong>${applicantName || "Applicant"}</strong>,</p>
            <p>Your barangay document request has been received.</p>
            <ul>
              <li><strong>Reference No:</strong> ${referenceNo || "-"}</li>
              <li><strong>Document Type:</strong> ${documentType || "-"}</li>
              <li><strong>Purpose:</strong> ${purpose || "-"}</li>
              <li><strong>Status:</strong> ${status || "draft"}</li>
            </ul>
            <p>Please keep your reference number for tracking.</p>
            <p>- DocuBay</p>
          </div>
        `;
      }

      if (type === "status_update") {
        subject = `DocuBay Request Update - ${referenceNo || "-"}`;
        html = `
          <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
            <h2>DocuBay Request Update</h2>
            <p>Hello <strong>${applicantName || "Applicant"}</strong>,</p>
            <p>There is an update to your request.</p>
            <ul>
              <li><strong>Reference No:</strong> ${referenceNo || "-"}</li>
              <li><strong>Document Type:</strong> ${documentType || "-"}</li>
              <li><strong>Status:</strong> ${status || "-"}</li>
              ${rejectionReason ? `<li><strong>Rejection Reason:</strong> ${rejectionReason}</li>` : ""}
            </ul>
            <p>- DocuBay</p>
          </div>
        `;
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.MAIL_FROM,
          to: [to],
          subject,
          html,
        }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: resendData?.message || "Failed to send email.",
            error: resendData,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      return new Response(JSON.stringify({ success: true, data: resendData }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || "Unexpected error.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};