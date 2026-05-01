// Import React hooks for state management and lifecycle handling
import { useEffect, useState } from "react";

// Import a layout wrapper component for staff pages
import StaffLayout from "../../components/layout/StaffLayout";

// Import service function that fetches audit logs (likely from backend/Firestore)
import { getAuditLogs } from "../../services/auditService";

// Import CSS styles specific to audit logs page
import "./Audit.css";

// Functional component for displaying audit logs
export default function AuditLogs() {
  
  // State to store fetched audit logs
  const [logs, setLogs] = useState([]);

  // State to track loading status (for UX feedback)
  const [loading, setLoading] = useState(true);

  // useEffect runs once when component mounts (empty dependency array [])
  useEffect(() => {

    // Async function to fetch logs
    const loadLogs = async () => {
      setLoading(true); // Start loading before fetch

      const data = await getAuditLogs(); // Fetch logs from service

      setLogs(data); // Store fetched logs in state

      setLoading(false); // Stop loading after data is retrieved
    };

    loadLogs(); // Execute the function

  }, []); // Empty array ensures this runs only once (on mount)

  return (
    // Wrap page inside StaffLayout with a title
    <StaffLayout title="Audit Logs">

      {/* Container for styling the table (card-like UI) */}
      <div className="audit-card">

        {/* Table structure for displaying logs */}
        <table className="audit-table">

          {/* Table Header */}
          <thead>
            <tr>
              <th>Action</th>
              <th>Role</th>
              <th>Request ID</th>
              <th>From</th>
              <th>To</th>
              <th>Remarks</th>
              <th>Date</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>

            {/* Case 1: Data is still loading */}
            {loading ? (
              <tr>
                {/* colSpan=7 makes the message span all columns */}
                <td colSpan="7">Loading audit logs...</td>
              </tr>

            /* Case 2: No logs returned from backend */
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7">No audit logs found.</td>
              </tr>

            /* Case 3: Logs exist → render each row */
            ) : (
              logs.map((log) => (
                <tr key={log.id}> {/* Unique key for React list rendering */}

                  {/* Display each field with fallback "-" if null/undefined */}
                  <td>{log.action || "-"}</td>
                  <td>{log.performerRole || "-"}</td>
                  <td>{log.requestId || "-"}</td>
                  <td>{log.fromStatus || "-"}</td>
                  <td>{log.toStatus || "-"}</td>
                  <td>{log.remarks || "-"}</td>

                  {/* Convert Firestore timestamp to readable date */}
                  <td>
                    {log.createdAt?.seconds
                      ? new Date(log.createdAt.seconds * 1000).toLocaleString()
                      : "-"}
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