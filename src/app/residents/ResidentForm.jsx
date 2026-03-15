import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ilocosNorteLocations from "../../data/ilocosNorteLocations.json";
import StaffLayout from "../../components/layout/StaffLayout";
import { useAuth } from "../../hooks/useAuth";
import { createResident } from "../../services/residentService";
import "./Residents.css";

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
];

export default function ResidentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    sex: "",
    age: "",
    birthDate: "",
    civilStatus: "",
    contactNumber: "",
    email: "",
    municipalityId: "",
    barangayId: "",
    purok: "",
    fullAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

const municipalityOptions = useMemo(() => {
  return Object.entries(ilocosNorteLocations || {}).map(
    ([municipality, barangays]) => ({
      value: municipality.trim(),
      label: municipality.trim(),
      barangays: Array.isArray(barangays)
        ? barangays.map((item) => String(item).trim())
        : [],
    })
  );
}, []);
  const barangayOptions = useMemo(() => {
    const selected = municipalityOptions.find(
      (item) => item.value === form.municipalityId
    );
    return selected?.barangays || [];
  }, [form.municipalityId, municipalityOptions]);

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
    const numericValue = Number(value);
    if (value === "") {
      setField("age", "");
      return;
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      age: form.age === "" ? "" : Number(form.age),
      fullName: [form.firstName, form.middleName, form.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    };

    const result = await createResident({
      data: payload,
      user,
    });

    setLoading(false);

    if (!result.success) {
      setSubmitError(result.message || "Failed to create resident.");
      return;
    }

    navigate("/staff/residents", { replace: true });
  };

  return (
 <StaffLayout title="Add Resident">
  <div className="resident-page">
    <div className="resident-form-card">
        {submitError ? <div className="resident-error">{submitError}</div> : null}

        <form onSubmit={handleSubmit} className="resident-form">
          <div className="resident-grid three">
            <div>
              <label>First Name</label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
              />
            </div>
            <div>
              <label>Middle Name</label>
              <input
                value={form.middleName}
                onChange={(e) => setField("middleName", e.target.value)}
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="resident-grid three">
            <div>
              <label>Suffix</label>
              <input
                value={form.suffix}
                onChange={(e) => setField("suffix", e.target.value)}
              />
            </div>

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
              />
            </div>
          </div>

          <div className="resident-grid three">
            <div>
              <label>Birth Date</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
              />
            </div>

            <div>
              <label>Civil Status</label>
              <select
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
              <label>Contact Number</label>
              <input
                value={form.contactNumber}
                onChange={(e) => setField("contactNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="resident-grid three">
            <div>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>

            <div>
              <label>Municipality / City</label>
              <select
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
          </div>

          <div className="resident-grid three">
            <div>
              <label>Sitio / Purok</label>
              <input
                value={form.purok}
                onChange={(e) => setField("purok", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Full Address</label>
            <textarea
              rows="3"
              value={form.fullAddress}
              onChange={(e) => setField("fullAddress", e.target.value)}
            />
          </div>

          <button className="resident-submit-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Resident"}
          </button>
        </form>
      </div>
        </div>
    </StaffLayout>
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