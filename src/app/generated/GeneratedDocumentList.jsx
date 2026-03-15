import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import { getGeneratedDocuments } from "../../services/documentGenerationService";
import "./GeneratedDocument.css";

export default function GeneratedDocumentList() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      const data = await getGeneratedDocuments();
      setDocuments(data);
      setLoading(false);
    };

    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return documents;

    return documents.filter((doc) => {
      return (
        String(doc.referenceNo || "").toLowerCase().includes(keyword) ||
        String(doc.templateLabel || "").toLowerCase().includes(keyword) ||
        String(doc.fileName || "").toLowerCase().includes(keyword)
      );
    });
  }, [documents, search]);

  return (
    <StaffLayout title="Generated Documents">
      <div className="resident-toolbar">
        <input
          type="text"
          placeholder="Search by reference no, template, or file name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="resident-table-wrap">
        <table className="resident-table">
          <thead>
            <tr>
              <th>Reference No</th>
              <th>Template</th>
              <th>File Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading generated documents...</td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="5">No generated documents found.</td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.referenceNo || "-"}</td>
                  <td>{doc.templateLabel || "-"}</td>
                  <td>{doc.fileName || "-"}</td>
                  <td>{doc.status || "-"}</td>
                  <td>
                    <Link
                      className="file-link"
                      to={`/staff/generated-documents/${doc.id}`}
                    >
                      Open Preview
                    </Link>
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