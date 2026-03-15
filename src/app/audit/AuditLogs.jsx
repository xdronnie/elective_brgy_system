// src/app/audit/AuditLogs.jsx
import { useEffect, useState } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import { getAuditLogs } from "../../services/auditService";
import "./Audit.css";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    };

    loadLogs();
  }, []);

  return (
    <StaffLayout title="Audit Logs">
      <div className="audit-card">
        <table className="audit-table">
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
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading audit logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7">No audit logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action || "-"}</td>
                  <td>{log.performerRole || "-"}</td>
                  <td>{log.requestId || "-"}</td>
                  <td>{log.fromStatus || "-"}</td>
                  <td>{log.toStatus || "-"}</td>
                  <td>{log.remarks || "-"}</td>
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