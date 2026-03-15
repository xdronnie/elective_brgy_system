import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import { getAllResidents, searchResidentsByLastName } from "../../services/residentService";
import "./Residents.css";

export default function ResidentList() {
  const [search, setSearch] = useState("");
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

const handleSearch = async () => {
  setLoading(true);

  let result = [];

  if (!search.trim()) {
    result = await getAllResidents();
  } else {
    result = await searchResidentsByLastName(search.trim());
  }

  setResidents(result);
  setLoading(false);
};

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <StaffLayout title="Resident Records">
      <div className="resident-toolbar">
        <input
          type="text"
          placeholder="Search by last name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>{loading ? "Searching..." : "Search"}</button>
        <Link className="resident-add-btn" to="/staff/residents/new">
          Add Resident
        </Link>
      </div>

      <div className="resident-table-wrap">
        <table className="resident-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan="4">No residents found.</td>
              </tr>
            ) : (
              residents.map((resident) => (
                <tr key={resident.id}>
                  <td>
                    {resident.firstName} {resident.middleName || ""} {resident.lastName}
                  </td>
                  <td>{resident.contactNumber || "-"}</td>
                  <td>{resident.email || "-"}</td>
                  <td>{resident.fullAddress || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}