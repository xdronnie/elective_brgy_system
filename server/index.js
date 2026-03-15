import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_APP_PASSWORD exists:", !!process.env.MAIL_APP_PASSWORD);
import "dotenv/config";
const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD,
  },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/send-request-email", async (req, res) => {
  try {
    const {
      to,
      type,
      applicantName,
      referenceNo,
      documentType,
      purpose,
      status,
      rejectionReason = "",
    } = req.body;

    if (!to || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing email recipient or email type.",
      });
    }

    let subject = "DocuBay Notification";
    let text = "";

    if (type === "submitted") {
      subject = `DocuBay Request Received - ${referenceNo || "-"}`;
      text =
        `Hello ${applicantName || "Applicant"},\n\n` +
        `Your request has been received.\n` +
        `Reference No: ${referenceNo || "-"}\n` +
        `Document Type: ${documentType || "-"}\n` +
        `Purpose: ${purpose || "-"}\n` +
        `Status: ${status || "draft"}\n\n` +
        `Please keep your reference number for tracking.\n\n` +
        `- DocuBay`;
    }

    if (type === "status_update") {
      subject = `DocuBay Request Update - ${referenceNo || "-"}`;
      text =
        `Hello ${applicantName || "Applicant"},\n\n` +
        `There is an update to your request.\n` +
        `Reference No: ${referenceNo || "-"}\n` +
        `Document Type: ${documentType || "-"}\n` +
        `Current Status: ${status || "-"}\n` +
        `${rejectionReason ? `Rejection Reason: ${rejectionReason}\n` : ""}\n` +
        `- DocuBay`;
    }

    await transporter.sendMail({
      from: `"DocuBay" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("send-request-email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email.",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mailer server running on http://localhost:${PORT}`);
});