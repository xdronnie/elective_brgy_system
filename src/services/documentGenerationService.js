import {
  addDoc,
  collection,
  doc,

  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { handleAppError } from "../utils/errorHandler";
import { mapDocumentData } from "../utils/documentMapper";
import { getDocumentTemplate } from "../constants/documentTemplates";
import { createAuditLog } from "./auditService";

export const generateDocument = async ({
  documentType,
  request,
  resident = {},
  user = null,
  settings = {},
}) => {
  try {
    const template = getDocumentTemplate(documentType);

    if (!template) {
      throw new Error(`No template found for document type: ${documentType}`);
    }

    if (!request?.id) {
      throw new Error("Request id is required for document generation.");
    }

    const mappedData = mapDocumentData({
      documentType,
      request,
      resident,
      settings,
    });

    validateRequiredFields(template.requiredFields, mappedData);
    // === AUTO-GENERATE OFFICIAL NUMBERS ===
    const resCertSeq = await getNextResCertSequence();
    const resCertNo = generateResCertNo(resCertSeq);
    const orNo = generateORNo();
    const feesPaid = getFeesPaid(documentType);

    mappedData.resCertNo = resCertNo;
    mappedData.orNo = orNo;
    mappedData.feesPaid = `₱${feesPaid}.00`;
    mappedData.orDate = new Date().toLocaleDateString('en-PH');
    // === END GENERATION ===
    const renderedHtml = renderCertificateHtml({
      template,
      data: mappedData,
    });

    const fileName = template.filename({
      referenceNo: mappedData.referenceNo,
      fullName: mappedData.fullName,
    });

    const generatedDocRef = await addDoc(collection(db, "generatedDocuments"), {
      requestId: request.id,
      residentId: request.residentId || resident.id || null,
      referenceNo: mappedData.referenceNo || "",
      documentType,
      templateLabel: template.label,
      templateFile: template.templateFile,
      fileName,
      generatedBy: user?.uid || null,
      generatedByRole: user?.role || null,
      generatedAt: serverTimestamp(),
      status: "generated_local",
      contentHtml: renderedHtml,
      payload: mappedData,
      resCertNo,
      orNo,
      feesPaid: feesPaid,
      orDate: mappedData.orDate,
    });

    await updateDoc(doc(db, "documentRequests", request.id), {
      documentGenerated: true,
      documentGeneratedAt: serverTimestamp(),
      documentGeneratedBy: user?.uid || null,
      documentFileName: fileName,
      documentTypeGenerated: documentType,
      generatedDocumentId: generatedDocRef.id,
      generatedDocumentStatus: "generated_local",
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      action: "generate_document",
      performedBy: user?.uid || null,
      performerRole: user?.role || null,
      requestId: request.id,
      residentId: request.residentId || resident.id || null,
      fromStatus: request.status || null,
      toStatus: request.status || null,
      remarks: `Generated ${template.label} (local/firestore mode)`,
    });

    return {
      success: true,
      generatedDocumentId: generatedDocRef.id,
      fileName,
      contentHtml: renderedHtml,
      payload: mappedData,
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "documentGenerationService.generateDocument",
      user,
      metadata: {
        documentType,
        requestId: request?.id || null,
        residentId: request?.residentId || resident?.id || null,
      },
      fallbackMessage: "Failed to generate document.",
    });
  }
};
export const getGeneratedDocuments = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "generatedDocuments"), orderBy("generatedAt", "desc"))
    );

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getGeneratedDocuments error:", error);
    return [];
  }
};
function generateORNo() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${yyyymmdd}-${random}`;
}
function getFeesPaid(documentType) {
  const feeMap = {
    'barangay_business_clearance': 150,
    'barangay_clearance': 100,
    'certificate_of_indigency': 50,
    'certificate_of_residency': 75,
    'first_time_jobseeker': 0,   // free under the act
    'good_moral': 100,
    // default fallback
  };
  return feeMap[documentType] ?? 100;
}

async function getNextResCertSequence() {
  const counterRef = doc(db, "counters", "resCertSequence");
  
  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentSeq = counterDoc.exists() ? counterDoc.data().value : 0;
      const nextSeq = currentSeq + 1;
      transaction.set(counterRef, { value: nextSeq });
      return nextSeq;
    });
    return result;
  } catch (error) {
    console.error("Failed to get ResCert sequence:", error);
    // Fallback: use timestamp as a one-off (not ideal but prevents crash)
    return Date.now() % 1000000;
  }
}

/**
 * Generate a Residence Certificate Number
 * Format: YY-XXXXXX (6-digit padding)
 */
function generateResCertNo(sequence) {
  const year = new Date().getFullYear().toString().slice(-2);
  const padded = sequence.toString().padStart(6, '0');
  return `${year}-${padded}`;
}

function validateRequiredFields(requiredFields = [], data = {}) {
  const missing = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length > 0) {
    throw new Error(`Missing required document field(s): ${missing.join(", ")}`);
  }
}

function renderCertificateHtml({ template, data }) {
  switch (template.type) {
    case "barangay_business_clearance":
      return renderBusinessClearance(data);
    case "barangay_clearance":
      return renderBarangayClearance(data);
    case "first_time_jobseeker":
      return renderFirstTimeJobseeker(data);
    case "good_moral":
      return renderGoodMoral(data);
    case "certificate_of_indigency":
      return renderIndigency(data);
    case "certificate_of_residency":
      return renderResidency(data);
    default:
      return renderFallbackDocument(template, data);
  }
}

function renderShell(title, body) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            font-family: "Times New Roman", serif;
            color: #111827;
            max-width: 850px;
            margin: 0 auto;
            padding: 48px 56px;
            line-height: 1.6;
          }
          .center { text-align: center; }
          .title {
            text-align: center;
            font-weight: 700;
            margin: 18px 0 20px;
            letter-spacing: 2px;
          }
          .section { margin-top: 18px; }
          .signature-block {
            margin-top: 48px;
            text-align: right;
          }
          .meta {
            margin-top: 28px;
            font-size: 14px;
          }
          .label {
            display: inline-block;
            min-width: 140px;
          }
          .officials {
            margin: 18px 0 24px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

function renderHeader(data) {
  return `
    <div class="center">
      <div>${escapeHtml(data.republic || "")}</div>
      <div>Province of ${escapeHtml(data.province || "")}</div>
      <div>Municipality of ${escapeHtml(data.municipality || "")}</div>
      <div><strong>BARANGAY ${escapeHtml((data.barangay || "").toUpperCase())}</strong></div>
      <br />
      <div><strong>${escapeHtml(data.office || "OFFICE OF THE PUNONG BARANGAY")}</strong></div>
    </div>
  `;
}

function renderOfficials(data) {
  return `
    <div class="officials">
      <strong>Barangay Officials</strong><br />
      Punong Barangay: ${escapeHtml(data.punongBarangay || data.approvedBy || "")}<br />
      Barangay Secretary: ${escapeHtml(data.barangaySecretary || "")}<br />
      Barangay Treasurer: ${escapeHtml(data.barangayTreasurer || "")}
    </div>
  `;
}

function renderBusinessClearance(data) {
  return renderShell(
    "Barangay Business Clearance",
    `
      ${renderHeader(data)}
      <div class="title">BARANGAY BUSINESS CLEARANCE</div>
      ${renderOfficials(data)}
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.fullName)}</strong>
        with business address at <strong>${escapeHtml(data.businessAddress)}</strong>
        has been granted this clearance.
      </p>
      <p>
        This clearance is issued in connection with
        <strong>${escapeHtml(data.purpose)}</strong>.
      </p>
      <p>
        Given this <strong>${escapeHtml(String(data.issueDay || ""))}</strong> day of
        <strong>${escapeHtml(data.issueMonth || "")}</strong>,
        <strong>${escapeHtml(String(data.issueYear || ""))}</strong>.
      </p>
      <div class="signature-block">
        Prepared by:<br /><br />
        <strong>${escapeHtml(data.preparedBy || "")}</strong><br />
        Barangay Treasurer
        <br /><br /><br />
        Approved:<br /><br />
    <strong>${escapeHtml(data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
      ${renderFooterMeta(data)}
    `
  );
}

function renderBarangayClearance(data) {
  return renderShell(
    "Barangay Clearance",
    `
      ${renderHeader(data)}
      <div class="title">BARANGAY CLEARANCE</div>
      ${renderOfficials(data)}
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.sexTitle || "MR./MS.")} ${escapeHtml(data.fullName)}</strong>,
        <strong>${escapeHtml(data.civilStatus || "single")}</strong>,
        <strong>${escapeHtml(String(data.age || "of legal age"))}</strong>,
        <strong>${escapeHtml(data.citizenship || "Filipino")}</strong> citizen and resident of
        <strong>${escapeHtml(data.addressLine)}</strong>.
      </p>
      <p>
        This clearance is issued upon the request of the above-named person for
        <strong>${escapeHtml(data.purpose)}</strong>.
      </p>
      <p>
        Issued this <strong>${escapeHtml(String(data.issueDay || ""))}</strong> day of
        <strong>${escapeHtml(data.issueMonth || "")}</strong>,
        <strong>${escapeHtml(String(data.issueYear || ""))}</strong>.
      </p>
      <div class="signature-block">
        Approved:<br /><br />
   <strong>${escapeHtml(data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
      ${renderFooterMeta(data)}
    `
  );
}

function renderFirstTimeJobseeker(data) {
  return renderShell(
    "First Time Jobseeker Certificate",
    `
      ${renderHeader(data)}
      <div class="title">CERTIFICATION</div>
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.sexTitle || "MR./MS.")} ${escapeHtml(data.fullName)}</strong>,
        <strong>${escapeHtml(data.civilStatus || "")}</strong>, and a bonafide resident of
        <strong>${escapeHtml(data.addressLine)}</strong> is qualified to avail of the First Time Jobseeker Act.
      </p>
      <p>
        ISSUED this <strong>${escapeHtml(data.issueDateText || "")}</strong> at
        <strong>${escapeHtml(data.issuedAt || "")}</strong>.
      </p>
      <div class="signature-block">
        Approved:<br /><br />
    <strong>${escapeHtml(data.approvedBy || data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
    `
  );
}

function renderGoodMoral(data) {
  return renderShell(
    "Good Moral Certificate",
    `
      ${renderHeader(data)}
      <div class="title">CERTIFICATION</div>
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.sexTitle || "MR./MS.")} ${escapeHtml(data.fullName)}</strong>,
        <strong>${escapeHtml(data.ageLabel || "of legal age")}</strong>,
        <strong>${escapeHtml(data.civilStatus || "")}</strong>, and resident of
        <strong>${escapeHtml(data.addressLine)}</strong> is known to be of good moral character.
      </p>
      <p>
        This certification is issued for <strong>${escapeHtml(data.purpose)}</strong>.
      </p>
      <div class="signature-block">
    <strong>${escapeHtml(data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
    `
  );
}

function renderIndigency(data) {
  return renderShell(
    "Certificate of Indigency",
    `
      ${renderHeader(data)}
      <div class="title">CERTIFICATION</div>
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.fullName)}</strong>,
        <strong>${escapeHtml(data.civilStatus || "")}</strong>, is a resident of
        <strong>${escapeHtml(data.addressLine)}</strong>.
      </p>
      <p>
        This is to certify further that the above-named person belongs to an indigent family in our barangay.
      </p>
      <p>
        This certification is issued for <strong>${escapeHtml(data.purpose)}</strong>.
      </p>
      <div class="signature-block">
      <strong>${escapeHtml(data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
    `
  );
}

function renderResidency(data) {
  return renderShell(
    "Certificate of Residency",
    `
      ${renderHeader(data)}
      <div class="title">CERTIFICATION</div>
      <div class="section">TO WHOM IT MAY CONCERN:</div>
      <p>
        This is to certify that <strong>${escapeHtml(data.fullName)}</strong>,
        <strong>${escapeHtml(data.civilStatus || "")}</strong>, is a resident of
        <strong>${escapeHtml(data.addressLine)}</strong>.
      </p>
      <p>
        This is to certify further that the above-named person is residing in this barangay.
      </p>
      <p>
        This certification is issued for <strong>${escapeHtml(data.purpose)}</strong>.
      </p>
      <div class="signature-block">
    <strong>${escapeHtml(data.punongBarangay || "")}</strong><br />
Punong Barangay
      </div>
      ${renderFooterMeta(data)}
    `
  );
}

function renderFallbackDocument(template, data) {
  return renderShell(
    template.label || "Generated Document",
    `
      ${renderHeader(data)}
      <div class="title">${escapeHtml(template.label || "Generated Document")}</div>
      <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
    `
  );
}

function renderFooterMeta(data) {
  return `
    <div class="meta">
      <div><span class="label">Res. Cert. No.:</span> ${escapeHtml(data.resCertNo || "")}</div>
      <div><span class="label">Issued On:</span> ${escapeHtml(data.issuedOn || "")}</div>
      <div><span class="label">Issued At:</span> ${escapeHtml(data.issuedAt || "")}</div>
      <div><span class="label">Fees Paid:</span> ${escapeHtml(data.feesPaid || "")}</div>
      <div><span class="label">O.R. No.:</span> ${escapeHtml(data.orNo || "")}</div>
      <div><span class="label">Date:</span> ${escapeHtml(data.orDate || "")}</div>
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}