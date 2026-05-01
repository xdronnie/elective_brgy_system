// Import React hooks for lifecycle, memoization, and state
import { useEffect, useMemo, useState } from "react";

// Import Link for navigation to preview page
import { Link } from "react-router-dom";

// Layout wrapper for staff pages
import StaffLayout from "../../components/layout/StaffLayout";

// Service function to fetch generated documents (likely from backend/Firestore)
import { getGeneratedDocuments } from "../../services/documentGenerationService";

// Import CSS styling
import "./GeneratedDocument.css";

export default function GeneratedDocumentList() {

  // State to store all generated documents
  const [documents, setDocuments] = useState([]);

  // State for search input
  const [search, setSearch] = useState("");

  // Loading state for UX feedback
  const [loading, setLoading] = useState(true);

  // useEffect runs once when component mounts
  useEffect(() => {

    // Async function to fetch documents
    const loadDocuments = async () => {
      setLoading(true); // Start loading

      const data = await getGeneratedDocuments(); // Fetch data from service

      setDocuments(data); // Store documents in state

      setLoading(false); // Stop loading
    };

    loadDocuments(); // Execute fetch

  }, []); // Empty dependency array → run only once

  // Memoized filtering logic (runs only when documents or search changes)
  const filteredDocuments = useMemo(() => {

    // Normalize search keyword (trim + lowercase for case-insensitive search)
    const keyword = search.trim().toLowerCase();

    // If no keyword, return full dataset
    if (!keyword) return documents;

    // Filter documents based on multiple fields
    return documents.filter((doc) => {
      return (
        // Match reference number
        String(doc.referenceNo || "").toLowerCase().includes(keyword) ||

        // Match template label (document type)
        String(doc.templateLabel || "").toLowerCase().includes(keyword) ||

        // Match file name
        String(doc.fileName || "").toLowerCase().includes(keyword)
      );
    });

  }, [documents, search]); // Recompute only when dependencies change

  return (
    // Wrap page inside StaffLayout
    <StaffLayout title="Generated Documents">

      {/* Toolbar for search input */}
      <div className="resident-toolbar">
        <input
          type="text"
          placeholder="Search by reference no, template, or file name"
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Update search state
        />
      </div>

      {/* Table container */}
      <div className="resident-table-wrap">
        <table className="resident-table">

          {/* Table header */}
          <thead>
            <tr>
              <th>Reference No</th>
              <th>Template</th>
              <th>File Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>

            {/* Case 1: Data is loading */}
            {loading ? (
              <tr>
                <td colSpan="5">Loading generated documents...</td>
              </tr>

            /* Case 2: No results after filtering */
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="5">No generated documents found.</td>
              </tr>

            /* Case 3: Display filtered documents */
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}> {/* Unique key for React rendering */}

                  {/* Display document details with fallback "-" */}
                  <td>{doc.referenceNo || "-"}</td>
                  <td>{doc.templateLabel || "-"}</td>
                  <td>{doc.fileName || "-"}</td>
                  <td>{doc.status || "-"}</td>

                  {/* Link to document preview page */}
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