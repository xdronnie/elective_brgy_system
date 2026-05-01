// Import React hooks for lifecycle and state management
import { useEffect, useState } from "react";

// Layout wrapper for staff/admin pages
import StaffLayout from "../../components/layout/StaffLayout";

// Service function to fetch aggregated request counts (likely from backend/Firestore)
import { getRequestCounts } from "../../services/requestService";

// Import CSS for dashboard styling
import "./Dashboard.css";

export default function AdminDashboard() {

  // State to store request statistics grouped by status
  const [counts, setCounts] = useState({
    total: 0,               // Total number of requests
    draft: 0,               // Requests still in draft state (not shown in UI but tracked)
    for_approval: 0,        // Pending approval
    approved: 0,            // Approved requests
    ready_for_pickup: 0,    // Documents ready for pickup
    released: 0,            // Completed/released requests
    rejected: 0,            // Denied requests
  });

  // useEffect runs once when component mounts
  useEffect(() => {

    // Async function to retrieve request counts
    const loadCounts = async () => {

      // Call backend/service layer to get aggregated counts
      const data = await getRequestCounts();

      // Update state → triggers re-render with latest values
      setCounts(data);
    };

    loadCounts(); // Execute data fetch

  }, []); // Empty dependency array = run only on initial render

  return (
    // Wrap page in StaffLayout with page title
    <StaffLayout title="Admin Dashboard">

      {/* Grid container for dashboard cards */}
      <div className="dashboard-grid">

        {/* Each card represents a specific request status */}

        <div className="dashboard-card">
          <h3>Total Requests</h3>
          <p>{counts.total}</p> {/* Display total count */}
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