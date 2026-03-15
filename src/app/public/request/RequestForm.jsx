import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ilocosNorteLocations from "../../../data/ilocosNorteLocations.json";
import { createRequest } from "../../../services/requestService";
import "./RequestForm.css";
import { sendRequestEmail } from "../../../services/publicEmailService";

const DOCUMENT_OPTIONS = [
  { value: "barangay_clearance", label: "Barangay Clearance" },
  { value: "barangay_business_clearance", label: "Barangay Business Clearance" },
  { value: "certificate_of_residency", label: "Certificate of Residency" },
  { value: "certificate_of_indigency", label: "Certificate of Indigency" },
  { value: "good_moral", label: "Good Moral Certificate" },
  { value: "first_time_jobseeker", label: "First Time Jobseeker Certificate" },
];

const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated"];

export default function RequestForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    age: "",
    birthDate: "",
    civilStatus: "",
    citizenship: "Filipino",
    contactNumber: "",
    email: "",
    municipalityId: "",
    barangayId: "",
    purok: "",
    fullAddress: "",
    documentType: "",
    purpose: "",
    businessName: "",
    businessAddress: "",
    recaptchaVerified: false,
    requestSource: "public_form",
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

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
      (item) => item.value === form.municipalityId
    );
    return selected?.barangays || [];
  }, [form.municipalityId, municipalityOptions]);

  const isBusinessClearance =
    form.documentType === "barangay_business_clearance";

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleMunicipalityChange = (value) => {
    setForm((prev) => ({
      ...prev,
      municipalityId: value,
      barangayId: "",
    }));
    setSubmitError("");
    setSubmitSuccess("");
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
    setSubmitSuccess("");
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "firstName", label: "First Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "lastName", label: "Last Name" },
      { key: "sex", label: "Sex" },
      { key: "age", label: "Age" },
      { key: "birthDate", label: "Birth Date" },
      { key: "civilStatus", label: "Civil Status" },
      { key: "citizenship", label: "Citizenship" },
      { key: "contactNumber", label: "Contact Number" },
      { key: "email", label: "Email Address" },
      { key: "municipalityId", label: "Municipality / City" },
      { key: "barangayId", label: "Barangay" },
      { key: "purok", label: "Sitio / Purok" },
      { key: "fullAddress", label: "Full Address" },
      { key: "documentType", label: "Document Type" },
      { key: "purpose", label: "Purpose" },
    ];

    if (isBusinessClearance) {
      requiredFields.push(
        { key: "businessName", label: "Business Name" },
        { key: "businessAddress", label: "Business Address" }
      );
    }

    const missingField = requiredFields.find(({ key }) => {
      const value = form[key];
      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missingField) {
      setSubmitError(`${missingField.label} is required.`);
      return false;
    }

    if (Number(form.age) < 0) {
      setSubmitError("Age cannot be negative.");
      return false;
    }

    return true;
  };

  const isFormComplete = useMemo(() => {
    const baseFields = [
      form.firstName,
      form.middleName,
      form.lastName,
      form.sex,
      form.age,
      form.birthDate,
      form.civilStatus,
      form.citizenship,
      form.contactNumber,
      form.email,
      form.municipalityId,
      form.barangayId,
      form.purok,
      form.fullAddress,
      form.documentType,
      form.purpose,
    ];

    const businessFields = isBusinessClearance
      ? [form.businessName, form.businessAddress]
      : [];

    return [...baseFields, ...businessFields].every(
      (value) => String(value ?? "").trim() !== ""
    );
  }, [form, isBusinessClearance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      age: form.age === "" ? "" : Number(form.age),
      fullName: [form.firstName, form.middleName, form.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    };

    const result = await createRequest({
      data: payload,
      user: null,
    });

    setLoading(false);

    if (!result?.success) {
      setSubmitError(result?.message || "Failed to submit request.");
      return;
    }

    await sendRequestEmail({
  to: payload.email,
  type: "submitted",
  applicantName: payload.fullName,
  referenceNo: result.referenceNo,
  documentType: payload.documentType,
  purpose: payload.purpose,
  status: "draft",
});

    setSubmitSuccess(
      `Request submitted successfully. Reference No: ${result.referenceNo || ""}`
    );
   
alert(`Request submitted successfully. Reference No: ${result.referenceNo || ""}`);
navigate(`/request/status/${result.id}`, { replace: true });

    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      sex: "",
      age: "",
      birthDate: "",
      civilStatus: "",
      citizenship: "Filipino",
      contactNumber: "",
      email: "",
      municipalityId: "",
      barangayId: "",
      purok: "",
      fullAddress: "",
      documentType: "",
      purpose: "",
      businessName: "",
      businessAddress: "",
      recaptchaVerified: false,
      requestSource: "public_form",
    });
  };

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
              Official Online Request Form for Barangay Documents
            </p>
<div className="request-form-top-links">
  <Link to="/login" className="request-top-link">
    Staff Login
  </Link>
  <Link to="/register" className="request-top-link request-top-link-outline">
    Staff Register
  </Link>
</div>

          </div>
        </div>

        <div className="request-form-guide">
          <h3>Instructions to the Applicant</h3>
          <ol>
            <li>Fill out all required fields completely and truthfully.</li>
            <li>Make sure your personal details match your valid records.</li>
            <li>Select the correct document type and provide a clear purpose.</li>
            <li>Review your entries before submitting the request.</li>
          </ol>
        </div>

        {submitError ? <div className="request-form-error">{submitError}</div> : null}
        {submitSuccess ? (
          <div className="request-form-success">{submitSuccess}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-section">
            <div className="form-section-header">
              <h2>Personal Information</h2>
              <p>Provide the applicant’s complete personal details.</p>
            </div>

            <div className="request-grid three">
              <div>
                <label>First Name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                />
              </div>

              <div>
                <label>Middle Name</label>
                <input
                  required
                  value={form.middleName}
                  onChange={(e) => setField("middleName", e.target.value)}
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                />
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
                      required
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
                      required
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label>Age</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                />
              </div>

              <div>
                <label>Birth Date</label>
                <input
                  required
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                />
              </div>
            </div>

            <div className="request-grid three">
              <div>
                <label>Civil Status</label>
                <select
                  required
                  value={form.civilStatus}
                  onChange={(e) => setField("civilStatus", e.target.value)}
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
                  required
                  value={form.citizenship}
                  onChange={(e) => setField("citizenship", e.target.value)}
                  placeholder="e.g. Filipino"
                />
              </div>

              <div>
                <label>Contact Number</label>
                <input
                  required
                  value={form.contactNumber}
                  onChange={(e) => setField("contactNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="request-grid three">
              <div>
                <label>Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h2>Address Information</h2>
              <p>Enter the applicant’s current address and barangay details.</p>
            </div>

            <div className="request-grid three">
              <div>
                <label>Municipality / City</label>
                <select
                  required
                  value={form.municipalityId}
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
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
                  required
                  value={form.barangayId}
                  onChange={(e) => setField("barangayId", e.target.value)}
                  disabled={!form.municipalityId}
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
                  required
                  value={form.purok}
                  onChange={(e) => setField("purok", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label>Full Address</label>
              <textarea
                required
                rows="3"
                value={form.fullAddress}
                onChange={(e) => setField("fullAddress", e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <h2>Document Request Details</h2>
              <p>Select the requested document and state the purpose clearly.</p>
            </div>

            <div className="request-grid two">
              <div>
                <label>Document Type</label>
                <select
                  required
                  value={form.documentType}
                  onChange={(e) => setField("documentType", e.target.value)}
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
                  required
                  value={form.purpose}
                  onChange={(e) => setField("purpose", e.target.value)}
                />
              </div>
            </div>

            {isBusinessClearance && (
              <div className="request-grid two">
                <div>
                  <label>Business Name</label>
                  <input
                    required
                    value={form.businessName}
                    onChange={(e) => setField("businessName", e.target.value)}
                  />
                </div>

                <div>
                  <label>Business Address</label>
                  <input
                    required
                    value={form.businessAddress}
                    onChange={(e) => setField("businessAddress", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section form-section-note">
            <p>
              By submitting this form, you confirm that the information provided is
              true and correct to the best of your knowledge.
            </p>
          </div>

          <button
            className="request-submit-btn"
            type="submit"
            disabled={loading || !isFormComplete}
          >
            {loading ? "Submitting Official Request..." : "Submit Official Request"}
          </button>
        </form>
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