// Import React hooks for managing state and lifecycle
import { useEffect, useState } from "react";

// Layout wrapper for consistent staff page structure
import StaffLayout from "../../components/layout/StaffLayout";

// Service function to retrieve aggregated request counts
import { getRequestCounts } from "../../services/requestService";

// Import dashboard-specific styles
import "./Dashboard.css";

export default function StaffDashboard() {

  // State to store request counts categorized by status
  const [counts, setCounts] = useState({
    total: 0,               // Total number of requests
    draft: 0,               // Requests still in draft stage
    for_approval: 0,        // Requests awaiting approval
    approved: 0,            // Approved requests
    ready_for_pickup: 0,    // Documents ready for pickup
    released: 0,            // Completed/released requests
    rejected: 0,            // Denied/rejected requests
  });

  // useEffect executes once when component mounts
  useEffect(() => {

    // Async function to fetch request statistics
    const loadCounts = async () => {

      // Call backend/service layer for aggregated counts
      const data = await getRequestCounts();

      // Update state with retrieved data → triggers UI update
      setCounts(data);
    };

    loadCounts(); // Execute fetch operation

  }, []); // Empty dependency array ensures one-time execution

  return (
    // Wrap dashboard inside StaffLayout with page title
    <StaffLayout title="Staff Dashboard">

      {/* Grid container for displaying dashboard cards */}
      <div className="dashboard-grid">

        {/* Each card represents a specific request status */}

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