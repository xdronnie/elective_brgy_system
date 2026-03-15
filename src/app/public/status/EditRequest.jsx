import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ilocosNorteLocations from "../../../data/ilocosNorteLocations.json";
import {
  getRequestById,
  resubmitRequest,
  updatePublicRequest,
} from "../../../services/requestService";
import "../request/RequestForm.css";

const DOCUMENT_OPTIONS = [
  { value: "barangay_clearance", label: "Barangay Clearance" },
  { value: "barangay_business_clearance", label: "Barangay Business Clearance" },
  { value: "certificate_of_residency", label: "Certificate of Residency" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency" },
  { value: "good_moral", label: "Good Moral Certificate" },
  { value: "first_time_jobseeker", label: "First Time Jobseeker Certificate" },
];

const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"];

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const municipalityOptions = useMemo(() => {
    return Object.entries(ilocosNorteLocations || {}).map(([municipality, barangays]) => ({
      value: municipality.trim(),
      label: municipality.trim(),
      barangays: Array.isArray(barangays)
        ? barangays.map((item) => String(item).trim())
        : [],
    }));
  }, []);

  const barangayOptions = useMemo(() => {
    const selected = municipalityOptions.find(
      (item) => item.value === form?.municipalityId
    );
    return selected?.barangays || [];
  }, [form?.municipalityId, municipalityOptions]);

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      const data = await getRequestById(id);

      if (!data) {
        setForm(null);
        setLoading(false);
        return;
      }

      setForm({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        sex: data.sex || "",
        age: data.age || "",
        birthDate: data.birthDate || "",
        civilStatus: data.civilStatus || "",
        citizenship: data.citizenship || "Filipino",
        contactNumber: data.contactNumber || "",
        email: data.email || "",
        municipalityId: data.municipalityId || "",
        barangayId: data.barangayId || "",
        purok: data.purok || "",
        fullAddress: data.fullAddress || "",
        documentType: data.documentType || "",
        purpose: data.purpose || "",
        businessName: data.businessName || "",
        businessAddress: data.businessAddress || "",
        status: data.status || "",
      });

      setLoading(false);
    };

    if (id) loadRequest();
  }, [id]);

  const isBusinessClearance =
    form?.documentType === "barangay_business_clearance";

  const canEdit = useMemo(() => {
    const status = String(form?.status || "");
    return ["draft", "for_approval", "rejected"].includes(status);
  }, [form]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError("");
  };

  const handleMunicipalityChange = (value) => {
    setForm((prev) => ({
      ...prev,
      municipalityId: value,
      barangayId: "",
    }));
    setSubmitError("");
  };

  const handleAgeChange = (value) => {
    if (value === "") {
      setField("age", "");
      return;
    }

    const numericValue = Number(value);
    setField("age", numericValue < 0 ? 0 : numericValue);
  };

  const handleBirthDateChange = (value) => {
    const computedAge = computeAge(value);

    setForm((prev) => ({
      ...prev,
      birthDate: value,
      age: computedAge === "" ? prev.age : computedAge,
    }));

    setSubmitError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      setSubmitError("This request can no longer be edited.");
      return;
    }

    setSaving(true);

    const result = await updatePublicRequest({
      requestId: id,
      data: {
        ...form,
        fullName: [form.firstName, form.middleName, form.lastName]
          .filter(Boolean)
          .join(" ")
          .trim(),
      },
    });

    if (!result?.success) {
      setSaving(false);
      setSubmitError(result?.message || "Failed to update request.");
      return;
    }

    if (form.status === "rejected") {
      await resubmitRequest(id);
    }

    setSaving(false);
    alert("Request updated successfully.");
    navigate(`/request/status/${id}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="request-form-page">
        <div className="request-form-card">
          <p>Loading request...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="request-form-page">
        <div className="request-form-card">
          <p>Request not found.</p>
          <Link to="/" className="request-top-link">
            Back to Request Form
          </Link>
        </div>
      </div>
    );
  }

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
              Edit and Resubmit Request
            </p>
          </div>
        </div>

        {submitError ? <div className="request-form-error">{submitError}</div> : null}

        {!canEdit ? (
          <div className="request-form-guide">
            <h3>This request can no longer be edited.</h3>
            <p>Please return to the status page to view the latest details.</p>
            <Link to={`/request/status/${id}`} className="request-top-link">
              Back to Status Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSave} className="request-form">
            <div className="form-section">
              <div className="form-section-header">
                <h2>Personal Information</h2>
                <p>Update your request details below.</p>
              </div>

              <div className="request-grid three">
                <div>
                  <label>First Name</label>
                  <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} required />
                </div>
                <div>
                  <label>Middle Name</label>
                  <input value={form.middleName} onChange={(e) => setField("middleName", e.target.value)} required />
                </div>
                <div>
                  <label>Last Name</label>
                  <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} required />
                </div>
              </div>

              <div className="request-grid three">
                <div>
                  <label>Sex</label>
                  <div className="inline-radio-group">
                    <label className="inline-radio">
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        checked={form.sex === "male"}
                        onChange={(e) => setField("sex", e.target.value)}
                      />
                      <span>Male</span>
                    </label>

                    <label className="inline-radio">
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        checked={form.sex === "female"}
                        onChange={(e) => setField("sex", e.target.value)}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Birth Date</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="request-grid three">
                <div>
                  <label>Civil Status</label>
                  <select
                    value={form.civilStatus}
                    onChange={(e) => setField("civilStatus", e.target.value)}
                    required
                  >
                    <option value="">Select civil status</option>
                    {CIVIL_STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item.toLowerCase()}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Citizenship</label>
                  <input
                    value={form.citizenship}
                    onChange={(e) => setField("citizenship", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Contact Number</label>
                  <input
                    value={form.contactNumber}
                    onChange={(e) => setField("contactNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="request-grid three">
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <h2>Address Information</h2>
              </div>

              <div className="request-grid three">
                <div>
                  <label>Municipality / City</label>
                  <select
                    value={form.municipalityId}
                    onChange={(e) => handleMunicipalityChange(e.target.value)}
                    required
                  >
                    <option value="">Select municipality / city</option>
                    {municipalityOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Barangay</label>
                  <select
                    value={form.barangayId}
                    onChange={(e) => setField("barangayId", e.target.value)}
                    disabled={!form.municipalityId}
                    required
                  >
                    <option value="">Select barangay</option>
                    {barangayOptions.map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Sitio / Purok</label>
                  <input
                    value={form.purok}
                    onChange={(e) => setField("purok", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Full Address</label>
                <textarea
                  rows="3"
                  value={form.fullAddress}
                  onChange={(e) => setField("fullAddress", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <h2>Document Request Details</h2>
              </div>

              <div className="request-grid two">
                <div>
                  <label>Document Type</label>
                  <select
                    value={form.documentType}
                    onChange={(e) => setField("documentType", e.target.value)}
                    required
                  >
                    <option value="">Select document type</option>
                    {DOCUMENT_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Purpose</label>
                  <input
                    value={form.purpose}
                    onChange={(e) => setField("purpose", e.target.value)}
                    required
                  />
                </div>
              </div>

              {isBusinessClearance && (
                <div className="request-grid two">
                  <div>
                    <label>Business Name</label>
                    <input
                      value={form.businessName}
                      onChange={(e) => setField("businessName", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Business Address</label>
                    <input
                      value={form.businessAddress}
                      onChange={(e) => setField("businessAddress", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <button className="request-submit-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save and Resubmit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function computeAge(birthDateValue) {
  if (!birthDateValue) return "";

  const birthDate = new Date(birthDateValue);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age < 0 ? 0 : age;
}