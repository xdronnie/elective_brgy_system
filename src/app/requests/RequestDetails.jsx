// src/app/requests/RequestDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import StaffLayout from "../../components/layout/StaffLayout";
import {
  getRequestById,
  updateRequestStatus,
  updateRequestDocumentSettings,
} from "../../services/requestService";
import { generateDocument } from "../../services/documentGenerationService";
import { REQUEST_STATUS } from "../../constants/requestStatus";
import { DOCUMENT_TEMPLATE_TYPES } from "../../constants/documentTemplates";
import { auth } from "../../firebase/config";
import "./RequestDetails.css";

const STATUS_OPTIONS = [
  REQUEST_STATUS.DRAFT,
  REQUEST_STATUS.FOR_APPROVAL,
  REQUEST_STATUS.APPROVED,
  REQUEST_STATUS.READY_FOR_PICKUP,
  REQUEST_STATUS.RELEASED,
  REQUEST_STATUS.REJECTED,
];

const DOCUMENT_TYPE_OPTIONS = [
  {
    value: DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE,
    label: "Barangay Business Clearance",
  },
  {
    value: DOCUMENT_TEMPLATE_TYPES.BARANGAY_CLEARANCE,
    label: "Barangay Clearance",
  },
  {
    value: DOCUMENT_TEMPLATE_TYPES.FIRST_TIME_JOBSEEKER,
    label: "First Time Jobseeker Certificate",
  },
  {
    value: DOCUMENT_TEMPLATE_TYPES.GOOD_MORAL,
    label: "Good Moral Certificate",
  },
  {
    value: DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_INDIGENCY,
    label: "Certificate of Indigency",
  },
  {
    value: DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_RESIDENCY,
    label: "Certificate of Residency",
  },
];

const DEFAULT_DOCUMENT_SETTINGS = {
  office: "OFFICE OF THE PUNONG BARANGAY",
  punongBarangay: "",
  barangaySecretary: "",
  barangayTreasurer: "",
  preparedBy: "",
  approvedByName: "",
  witnessedBy: "",
  issuedAt: "",
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusValue, setStatusValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [documentSettings, setDocumentSettings] = useState(DEFAULT_DOCUMENT_SETTINGS);
  const [savingDocumentSettings, setSavingDocumentSettings] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      const data = await getRequestById(id);

      if (!data) {
        setRequest(null);
        setLoading(false);
        return;
      }

      setRequest(data);
      setStatusValue(data.status || REQUEST_STATUS.DRAFT);
      setSelectedDocumentType(inferDocumentType(data));
      setDocumentSettings({
        office:
          data?.documentSettings?.office ||
          DEFAULT_DOCUMENT_SETTINGS.office,
        punongBarangay:
          data?.documentSettings?.punongBarangay ||
          DEFAULT_DOCUMENT_SETTINGS.punongBarangay,
        barangaySecretary:
          data?.documentSettings?.barangaySecretary ||
          DEFAULT_DOCUMENT_SETTINGS.barangaySecretary,
        barangayTreasurer:
          data?.documentSettings?.barangayTreasurer ||
          DEFAULT_DOCUMENT_SETTINGS.barangayTreasurer,
        preparedBy:
          data?.documentSettings?.preparedBy ||
          DEFAULT_DOCUMENT_SETTINGS.preparedBy,
        approvedByName:
          data?.documentSettings?.approvedByName ||
          DEFAULT_DOCUMENT_SETTINGS.approvedByName,
        witnessedBy:
          data?.documentSettings?.witnessedBy ||
          DEFAULT_DOCUMENT_SETTINGS.witnessedBy,
        issuedAt:
          data?.documentSettings?.issuedAt ||
          buildIssuedAt(data),
      });
      setLoading(false);
    };

    loadRequest();
  }, [id]);

  const currentUser = useMemo(() => {
    const firebaseUser = auth?.currentUser;

    return {
      uid: firebaseUser?.uid || null,
      email: firebaseUser?.email || null,
      role: localStorage.getItem("userRole") || "staff",
    };
  }, []);

  const normalizedStatus = String(request?.status || "").toLowerCase().trim();

  const canGenerate =
    normalizedStatus === "approved" || normalizedStatus === "ready_for_pickup";

  const setDocumentSetting = (key, value) => {
    setDocumentSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUpdateStatus = async () => {
    if (!request?.id || !statusValue) return;

    setSavingStatus(true);

    const result = await updateRequestStatus({
      requestId: request.id,
      newStatus: statusValue,
      user: currentUser,
      remarks,
      rejectionReason,
    });

    if (result?.success) {
      const refreshed = await getRequestById(request.id);
      setRequest(refreshed);
      setStatusValue(refreshed?.status || statusValue);
      alert("Request status updated successfully.");
    } else {
      alert(result?.message || "Failed to update request status.");
    }

    setSavingStatus(false);
  };

  const handleSaveDocumentSettings = async () => {
    if (!request?.id) return;

    setSavingDocumentSettings(true);

    const payload = {
      ...documentSettings,
      issuedAt:
        documentSettings.issuedAt?.trim() || buildIssuedAt(request),
    };

    const result = await updateRequestDocumentSettings({
      requestId: request.id,
      documentSettings: payload,
      user: currentUser,
    });

    if (result?.success) {
      const refreshed = await getRequestById(request.id);
      setRequest(refreshed);
      setDocumentSettings({
        office:
          refreshed?.documentSettings?.office ||
          DEFAULT_DOCUMENT_SETTINGS.office,
        punongBarangay:
          refreshed?.documentSettings?.punongBarangay || "",
        barangaySecretary:
          refreshed?.documentSettings?.barangaySecretary || "",
        barangayTreasurer:
          refreshed?.documentSettings?.barangayTreasurer || "",
        preparedBy:
          refreshed?.documentSettings?.preparedBy || "",
        approvedByName:
          refreshed?.documentSettings?.approvedByName || "",
        witnessedBy:
          refreshed?.documentSettings?.witnessedBy || "",
        issuedAt:
          refreshed?.documentSettings?.issuedAt || buildIssuedAt(refreshed),
      });
      alert("Document settings saved successfully.");
    } else {
      alert(result?.message || "Failed to save document settings.");
    }

    setSavingDocumentSettings(false);
  };

  const handleGenerateDocument = async () => {
    if (!request?.id) return;

    const normalized = String(request?.status || "").toLowerCase().trim();

    if (normalized !== "approved" && normalized !== "ready_for_pickup") {
      alert("Document generation is only allowed for approved or ready for pickup requests.");
      return;
    }

    if (!selectedDocumentType) {
      alert("Please select a document template first.");
      return;
    }

    setGenerating(true);

    const finalSettings = {
      province: "Ilocos Norte",
      municipality: request?.municipalityId || "",
      barangay: request?.barangayId || "",
      office:
        documentSettings.office || "OFFICE OF THE PUNONG BARANGAY",
      punongBarangay: documentSettings.punongBarangay || "",
      barangaySecretary: documentSettings.barangaySecretary || "",
      barangayTreasurer: documentSettings.barangayTreasurer || "",
      issuedAt: documentSettings.issuedAt || buildIssuedAt(request),
      preparedBy: documentSettings.preparedBy || "",
      approvedBy: documentSettings.approvedByName || "",
      witnessedBy: documentSettings.witnessedBy || "",
    };

    const result = await generateDocument({
      documentType: selectedDocumentType,
      request,
      resident: buildResidentFromRequest(request),
      user: currentUser,
      settings: finalSettings,
    });

    console.log("generateDocument result:", result);

    if (result?.success) {
      const refreshed = await getRequestById(request.id);
      setRequest(refreshed);
      alert("Document generated successfully.");
    } else {
      console.error("Generate document failed:", result);
      alert(result?.message || "Failed to generate document.");
    }

    setGenerating(false);
  };

  if (loading) {
    return (
      <StaffLayout title="Request Details">
        <div className="request-details-card">Loading request...</div>
      </StaffLayout>
    );
  }

  if (!request) {
    return (
      <StaffLayout title="Request Details">
        <div className="request-details-card">
          <p>Request not found.</p>
          <button className="primary-btn" onClick={() => navigate("/staff/requests")}>
            Back to Requests
          </button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title="Request Details">
      <div className="request-details-page">
        <div className="request-details-card">
          <div className="request-details-header">
            <p className="muted-text">Raw status: {String(request?.status || "")}</p>
            <p className="muted-text">Can generate: {canGenerate ? "YES" : "NO"}</p>
            <p className="muted-text">Selected template: {selectedDocumentType || "(none)"}</p>

            <div>
              <h2>Reference No: {request.referenceNo || "-"}</h2>
              <p className="muted-text">Request ID: {request.id}</p>
            </div>

            <span className={`status-badge status-${normalizeStatusClass(request.status)}`}>
              {request.status || "-"}
            </span>
          </div>

          <div className="details-grid">
            <DetailItem label="Full Name" value={request.fullName} />
            <DetailItem label="Document Type" value={request.documentType} />
            <DetailItem label="Purpose" value={request.purpose} />
            <DetailItem label="Civil Status" value={request.civilStatus} />
            <DetailItem label="Age" value={request.age} />
            <DetailItem label="Sex" value={request.sex} />
            <DetailItem label="Citizenship" value={request.citizenship} />
            <DetailItem label="Municipality / City" value={request.municipalityId} />
            <DetailItem label="Barangay" value={request.barangayId} />
            <DetailItem label="Address" value={request.address || request.fullAddress} />
            <DetailItem label="Resident ID" value={request.residentId} />
            <DetailItem label="Business Name" value={request.businessName} />
            <DetailItem label="Business Address" value={request.businessAddress} />
            <DetailItem label="Created By" value={request.createdBy} />
            <DetailItem label="Created At" value={formatTimestamp(request.createdAt)} />
            <DetailItem label="Updated At" value={formatTimestamp(request.updatedAt)} />
            <DetailItem label="Approved At" value={formatTimestamp(request.approvedAt)} />
            <DetailItem label="Released At" value={formatTimestamp(request.releasedAt)} />
            <DetailItem label="Rejection Reason" value={request.rejectionReason} />
          </div>
        </div>

        <div className="request-details-card">
          <h3>Update Status</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Remarks</label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
              />
            </div>

            {statusValue === REQUEST_STATUS.REJECTED && (
              <div className="form-group form-group-full">
                <label>Rejection Reason</label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                />
              </div>
            )}
          </div>

          <div className="actions-row">
            <button
              className="primary-btn"
              onClick={handleUpdateStatus}
              disabled={savingStatus}
            >
              {savingStatus ? "Saving..." : "Update Status"}
            </button>
          </div>
        </div>

        <div className="request-details-card">
          <h3>Document Settings / Signatories</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Province</label>
              <input type="text" value="Ilocos Norte" disabled />
            </div>

            <div className="form-group">
              <label>Municipality / City</label>
              <input
                type="text"
                value={request?.municipalityId || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Barangay</label>
              <input
                type="text"
                value={request?.barangayId || ""}
                disabled
              />
            </div>

            <div className="form-group form-group-full">
              <label>Office</label>
              <input
                type="text"
                value={documentSettings.office}
                onChange={(e) => setDocumentSetting("office", e.target.value)}
                placeholder="OFFICE OF THE PUNONG BARANGAY"
              />
            </div>

            <div className="form-group">
              <label>Punong Barangay</label>
              <input
                type="text"
                value={documentSettings.punongBarangay}
                onChange={(e) =>
                  setDocumentSetting("punongBarangay", e.target.value)
                }
                placeholder="Enter punong barangay name"
              />
            </div>

            <div className="form-group">
              <label>Barangay Secretary</label>
              <input
                type="text"
                value={documentSettings.barangaySecretary}
                onChange={(e) =>
                  setDocumentSetting("barangaySecretary", e.target.value)
                }
                placeholder="Enter barangay secretary name"
              />
            </div>

            <div className="form-group">
              <label>Barangay Treasurer</label>
              <input
                type="text"
                value={documentSettings.barangayTreasurer}
                onChange={(e) =>
                  setDocumentSetting("barangayTreasurer", e.target.value)
                }
                placeholder="Enter barangay treasurer name"
              />
            </div>

            <div className="form-group">
              <label>Prepared By</label>
              <input
                type="text"
                value={documentSettings.preparedBy}
                onChange={(e) =>
                  setDocumentSetting("preparedBy", e.target.value)
                }
                placeholder="Enter prepared by"
              />
            </div>

            <div className="form-group">
              <label>Approved By</label>
              <input
                type="text"
                value={documentSettings.approvedByName}
                onChange={(e) =>
                  setDocumentSetting("approvedByName", e.target.value)
                }
                placeholder="Enter approved by"
              />
            </div>

            <div className="form-group">
              <label>Witnessed By</label>
              <input
                type="text"
                value={documentSettings.witnessedBy}
                onChange={(e) =>
                  setDocumentSetting("witnessedBy", e.target.value)
                }
                placeholder="Enter witnessed by"
              />
            </div>

            <div className="form-group form-group-full">
              <label>Issued At</label>
              <input
                type="text"
                value={documentSettings.issuedAt}
                onChange={(e) => setDocumentSetting("issuedAt", e.target.value)}
                placeholder="Upon, Pinili, Ilocos Norte"
              />
            </div>
          </div>

          <div className="actions-row">
            <button
              className="secondary-btn"
              onClick={handleSaveDocumentSettings}
              disabled={savingDocumentSettings}
            >
              {savingDocumentSettings ? "Saving..." : "Save Document Settings"}
            </button>
          </div>
        </div>

        <div className="request-details-card">
          <h3>Document Generation</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Document Template</label>
              <select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
              >
                <option value="">Select document template</option>
                {DOCUMENT_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Generation Status</label>
              <input
                type="text"
                value={request.documentGenerated ? "Generated" : "Not yet generated"}
                disabled
              />
            </div>

            <div className="form-group form-group-full">
              <label>Generated File</label>
              <div className="generated-file-box">
                {request.generatedDocumentId ? (
                  <Link
                    to={`/staff/generated-documents/${request.generatedDocumentId}`}
                    className="file-link"
                  >
                    {request.documentFileName || "Open generated document"}
                  </Link>
                ) : (
                  <span className="muted-text">No generated file yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="actions-row">
            <button
              className="primary-btn"
              onClick={handleGenerateDocument}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Document"}
            </button>

            {request.generatedDocumentId && (
              <Link
                to={`/staff/generated-documents/${request.generatedDocumentId}`}
                className="secondary-btn"
              >
                Open Generated Document
              </Link>
            )}
          </div>

          {!canGenerate && (
            <p className="helper-text">
              Document generation is only available when the request is Approved or Ready for Pickup.
            </p>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <strong className="detail-value">{value || "-"}</strong>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "-";

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString();
  }

  if (typeof value === "string" || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }

  return "-";
}

function normalizeStatusClass(status = "") {
  return String(status).toLowerCase().replaceAll("_", "-");
}

function formatStatusLabel(status = "") {
  return String(status)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferDocumentType(request = {}) {
  const rawType = String(request.documentType || "").toLowerCase();

  if (rawType.includes("business") && rawType.includes("clearance")) {
    return DOCUMENT_TEMPLATE_TYPES.BARANGAY_BUSINESS_CLEARANCE;
  }

  if (rawType.includes("clearance")) {
    return DOCUMENT_TEMPLATE_TYPES.BARANGAY_CLEARANCE;
  }

  if (rawType.includes("jobseeker")) {
    return DOCUMENT_TEMPLATE_TYPES.FIRST_TIME_JOBSEEKER;
  }

  if (rawType.includes("good moral")) {
    return DOCUMENT_TEMPLATE_TYPES.GOOD_MORAL;
  }

  if (rawType.includes("indigency")) {
    return DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_INDIGENCY;
  }

  if (rawType.includes("residency") || rawType.includes("residence")) {
    return DOCUMENT_TEMPLATE_TYPES.CERTIFICATE_OF_RESIDENCY;
  }

  return "";
}

function buildResidentFromRequest(request = {}) {
  const firstName = request.firstName || request.givenName || "";
  const middleName = request.middleName || "";
  const lastName = request.lastName || request.surname || "";

  return {
    id: request.residentId || null,
    fullName:
      request.fullName ||
      request.name ||
      [firstName, middleName, lastName].filter(Boolean).join(" "),
    firstName,
    middleName,
    lastName,
    civilStatus: request.civilStatus || "",
    age: request.age || "",
    sex: request.sex || "",
    citizenship: request.citizenship || "Filipino",
    address: request.address || request.fullAddress || "",
    contactNumber: request.contactNumber || "",
    purok: request.purok || "",
    sitio: request.sitio || "",
    birthDate: request.birthDate || "",
    municipalityId: request.municipalityId || "",
    barangayId: request.barangayId || "",
  };
}

function buildIssuedAt(request = {}) {
  const barangay = request?.barangayId || "";
  const municipality = request?.municipalityId || "";
  const province = "Ilocos Norte";

  return [barangay, municipality, province].filter(Boolean).join(", ");
}