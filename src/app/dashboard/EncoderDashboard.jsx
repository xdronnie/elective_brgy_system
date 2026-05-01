// Import React hooks for lifecycle and state management
import { useEffect, useState } from "react";

// Layout wrapper for staff pages
import StaffLayout from "../../components/layout/StaffLayout";

// Service function to fetch aggregated request counts
import { getRequestCounts } from "../../services/requestService";

// Import dashboard-specific styles
import "./Dashboard.css";

export default function EncoderDashboard() {

  // State object to store request counts by status
  const [counts, setCounts] = useState({
    total: 0,               // Total number of requests
    draft: 0,               // Requests still being encoded (important for encoder role)
    for_approval: 0,        // Requests submitted for approval
    approved: 0,            // Approved requests
    ready_for_pickup: 0,    // Not displayed but included for consistency
    released: 0,            // Not displayed but included for consistency
    rejected: 0,            // Not displayed but included for consistency
  });

  // useEffect runs once when component mounts
  useEffect(() => {

    // Async function to load request counts
    const loadCounts = async () => {

      // Fetch aggregated counts from backend/service layer
      const data = await getRequestCounts();

      // Update state with fetched data → triggers UI re-render
      setCounts(data);
    };

    loadCounts(); // Execute data fetching

  }, []); // Empty dependency array ensures this runs only once

  return (
    // Wrap content in StaffLayout with role-specific title
    <StaffLayout title="Secretary / Encoder Dashboard">

      {/* Grid layout for dashboard cards */}
      <div className="dashboard-grid">

        {/* Total Requests */}
        <div className="dashboard-card">
          <h3>Total Requests</h3>
          <p>{counts.total}</p>
        </div>

        {/* Draft Requests (important for encoder workflow) */}
        <div className="dashboard-card">
          <h3>Draft</h3>
          <p>{counts.draft}</p>
        </div>

        {/* Requests waiting for approval */}
        <div className="dashboard-card">
          <h3>For Approval</h3>
          <p>{counts.for_approval}</p>
        </div>

        {/* Approved requests */}
        <div className="dashboard-card">
          <h3>Approved</h3>
          <p>{counts.approved}</p>
        </div>

      </div>
    </StaffLayout>
  );
}