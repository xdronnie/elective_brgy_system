// src/app/requests/RequestList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import { getAllRequests } from "../../services/requestService";
import "./Requests.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "for_approval", label: "For Approval" },
  { value: "approved", label: "Approved" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "released", label: "Released" },
  { value: "rejected", label: "Rejected" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: "", label: "All Document Types" },
  { value: "barangay_clearance", label: "Barangay Clearance" },
  { value: "barangay_business_clearance", label: "Barangay Business Clearance" },
  { value: "certificate_of_residency", label: "Certificate of Residency" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency" },
  { value: "good_moral", label: "Good Moral Certificate" },
  { value: "first_time_jobseeker", label: "First Time Jobseeker Certificate" },
];

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
      setLoading(false);
    };

    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return requests.filter((request) => {
      const applicantName = getApplicantName(request).toLowerCase();
      const referenceNo = String(request.referenceNo || "").toLowerCase();
      const documentLabel = formatDocumentType(request.documentType).toLowerCase();

      const matchesSearch =
        !searchValue ||
        applicantName.includes(searchValue) ||
        referenceNo.includes(searchValue) ||
        documentLabel.includes(searchValue);

      const matchesStatus = !statusFilter || request.status === statusFilter;
      const matchesDocumentType =
        !documentTypeFilter || request.documentType === documentTypeFilter;

      return matchesSearch && matchesStatus && matchesDocumentType;
    });
  }, [requests, search, statusFilter, documentTypeFilter]);

  return (
    <StaffLayout title="Document Requests">
      <div className="requests-header">
  <h2>Request Records</h2>
  <p>{filteredRequests.length} request(s) found</p>
</div>
      <div className="requests-toolbar">
        <input
          type="text"
          placeholder="Search by reference no. or applicant name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item.value || "all-status"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={documentTypeFilter}
          onChange={(e) => setDocumentTypeFilter(e.target.value)}
        >
          {DOCUMENT_TYPE_OPTIONS.map((item) => (
            <option key={item.value || "all-document-types"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="requests-table-wrap">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Reference No.</th>
              <th>Applicant</th>
              <th>Document Type</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading requests...</td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6">No requests found.</td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.referenceNo || "-"}</td>
                  <td>{getApplicantName(request)}</td>
                  <td>{formatDocumentType(request.documentType)}</td>
                  <td>
                    <span className={`status-badge status-${normalizeStatusClass(request.status)}`}>
                      {formatStatusLabel(request.status)}
                    </span>
                  </td>
                  <td>{formatTimestamp(request.createdAt)}</td>
                  <td>
                    <Link className="request-view-btn" to={`/staff/requests/${request.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}

function getApplicantName(request = {}) {
  const topLevelName =
    request.fullName ||
    [request.firstName, request.middleName, request.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  const snapshotName =
    request.applicantSnapshot?.fullName ||
    [
      request.applicantSnapshot?.firstName,
      request.applicantSnapshot?.middleName,
      request.applicantSnapshot?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return topLevelName || snapshotName || "-";
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

function formatStatusLabel(value = "") {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatusClass(value = "") {
  return String(value).toLowerCase().replaceAll("_", "-");
}

function formatTimestamp(value) {
  if (!value) return "-";

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString();
  }

  return "-";
}