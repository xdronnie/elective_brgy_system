import { useEffect, useState } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import { getRequestCounts } from "../../services/requestService";
import "./Dashboard.css";

export default function StaffDashboard() {
  const [counts, setCounts] = useState({
    total: 0,
    draft: 0,
    for_approval: 0,
    approved: 0,
    ready_for_pickup: 0,
    released: 0,
    rejected: 0,
  });

  useEffect(() => {
    const loadCounts = async () => {
      const data = await getRequestCounts();
      setCounts(data);
    };

    loadCounts();
  }, []);

  return (
    <StaffLayout title="Staff Dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Requests</h3>
          <p>{counts.total}</p>
        </div>

        <div className="dashboard-card">
          <h3>Draft</h3>
          <p>{counts.draft}</p>
        </div>

        <div className="dashboard-card">
          <h3>For Approval</h3>
          <p>{counts.for_approval}</p>
        </div>

        <div className="dashboard-card">
          <h3>Approved</h3>
          <p>{counts.approved}</p>
        </div>

        <div className="dashboard-card">
          <h3>Ready for Pickup</h3>
          <p>{counts.ready_for_pickup}</p>
        </div>

        <div className="dashboard-card">
          <h3>Released</h3>
          <p>{counts.released}</p>
        </div>

        <div className="dashboard-card">
          <h3>Rejected</h3>
          <p>{counts.rejected}</p>
        </div>
      </div>
    </StaffLayout>
  );
}