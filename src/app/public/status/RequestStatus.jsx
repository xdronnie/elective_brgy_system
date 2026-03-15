import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getRequestById } from "../../../services/requestService";
import "../request/RequestForm.css";
import "./RequestStatus.css";

export default function RequestStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      const data = await getRequestById(id);
      setRequest(data);
      setLoading(false);
    };

    if (id) loadRequest();
  }, [id]);

  const canEdit = useMemo(() => {
    const status = String(request?.status || "");
    return ["draft", "for_approval", "rejected"].includes(status);
  }, [request]);

  return (
    <div className="request-form-page">
      <div className="request-form-card">
        <div className="gov-header gov-header-single-seal">
          <div className="gov-header-left">
            <div className="gov-seal">BRGY</div>
          </div>

          <div className="gov-header-center">
            <h1>DocuBay: Barangay Document Request System</h1>
            <p className="gov-header-subtitle">
              Request Status Dashboard
            </p>
          </div>
        </div>

        {loading ? (
          <div className="status-card">
            <p>Loading request details...</p>
          </div>
        ) : !request ? (
          <div className="status-card">
            <p>Request not found.</p>
            <div className="status-actions">
              <button
                className="request-submit-btn"
                onClick={() => navigate("/")}
              >
                Back to Request Form
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="status-card">
              <div className="status-card-header">
                <div>
                  <h2>Reference No: {request.referenceNo || "-"}</h2>
                  <p className="status-subtext">
                    Submitted request details and current processing status
                  </p>
                </div>

                <span className={`status-pill status-${normalizeStatusClass(request.status)}`}>
                  {formatStatusLabel(request.status)}
                </span>
              </div>

              <div className="status-grid">
                <StatusItem label="Applicant" value={request.fullName} />
                <StatusItem label="Document Type" value={formatDocumentType(request.documentType)} />
                <StatusItem label="Purpose" value={request.purpose} />
                <StatusItem label="Sex" value={request.sex} />
                <StatusItem label="Age" value={request.age} />
                <StatusItem label="Birth Date" value={request.birthDate} />
                <StatusItem label="Civil Status" value={request.civilStatus} />
                <StatusItem label="Citizenship" value={request.citizenship} />
                <StatusItem label="Contact Number" value={request.contactNumber} />
                <StatusItem label="Email" value={request.email} />
                <StatusItem label="Municipality / City" value={request.municipalityId} />
                <StatusItem label="Barangay" value={request.barangayId} />
                <StatusItem label="Sitio / Purok" value={request.purok} />
                <StatusItem label="Full Address" value={request.fullAddress} />
                <StatusItem label="Submitted At" value={formatTimestamp(request.createdAt)} />
                <StatusItem label="Last Updated" value={formatTimestamp(request.updatedAt)} />
              </div>

              {request.rejectionReason ? (
                <div className="status-note status-note-error">
                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                </div>
              ) : null}
            </div>

            <div className="status-actions-card">
              <div className="status-actions">
                {canEdit && (
                  <Link
                    to={`/request/edit/${request.id}`}
                    className="request-top-link"
                  >
                    Edit Request
                  </Link>
                )}

                <Link
                  to="/"
                  className="request-top-link request-top-link-outline"
                >
                  Submit Another Request
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusItem({ label, value }) {
  return (
    <div className="status-item">
      <span className="status-label">{label}</span>
      <strong className="status-value">{value || "-"}</strong>
    </div>
  );
}

function normalizeStatusClass(value = "") {
  return String(value).toLowerCase().replaceAll("_", "-");
}

function formatStatusLabel(value = "") {
  if (!value) return "-";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDocumentType(value = "") {
  const map = {
    barangay_clearance: "Barangay Clearance",
    barangay_business_clearance: "Barangay Business Clearance",
    certificate_of_residency: "Certificate of Residency",
    certificate_of_indigency: "Certificate of Indigency",
    good_moral: "Good Moral Certificate",
    first_time_jobseeker: "First Time Jobseeker Certificate",
  };

  return map[value] || value || "-";
}

function formatTimestamp(value) {
  if (!value) return "-";
  if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();

  return "-";
}