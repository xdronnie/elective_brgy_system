// Import Firestore functions for document retrieval
import { doc, getDoc } from "firebase/firestore";

// Import React hooks
import { useEffect, useState } from "react";

// Import routing utilities
import { useNavigate, useParams } from "react-router-dom";

// Layout wrapper for staff pages
import StaffLayout from "../../components/layout/StaffLayout";

// Firestore database instance
import { db } from "../../firebase/config";

// Import styling
import "./GeneratedDocument.css";

export default function GeneratedDocumentPreview() {

  // Extract document ID from URL parameters
  const { id } = useParams();

  // Hook for navigation (e.g., back button)
  const navigate = useNavigate();

  // State to store fetched document data
  const [documentData, setDocumentData] = useState(null);

  // Loading state for UX handling
  const [loading, setLoading] = useState(true);

  // useEffect runs when component mounts or when 'id' changes
  useEffect(() => {

    // Async function to fetch a single generated document
    const loadGeneratedDocument = async () => {
      try {
        setLoading(true); // Start loading

        // Create Firestore reference to specific document
        const ref = doc(db, "generatedDocuments", id);

        // Fetch document snapshot
        const snap = await getDoc(ref);

        // If document does not exist
        if (!snap.exists()) {
          setDocumentData(null);
          setLoading(false);
          return;
        }

        // Store document data in state (include ID + fields)
        setDocumentData({
          id: snap.id,
          ...snap.data(),
        });

      } catch (error) {
        // Log error for debugging
        console.error("loadGeneratedDocument error:", error);

        // Reset state if error occurs
        setDocumentData(null);

      } finally {
        // Ensure loading stops regardless of success/failure
        setLoading(false);
      }
    };

    // Only fetch if ID exists (prevents invalid calls)
    if (id) loadGeneratedDocument();

  }, [id]); // Dependency ensures re-fetch if ID changes

  // Handle print action
  const handlePrint = () => {
    window.print(); // Triggers browser print dialog
  };

  return (
    // Wrap page with layout and title
    <StaffLayout title="Generated Document Preview">

      <div className="generated-doc-page">

        {/* Toolbar (hidden during print using CSS .no-print) */}
        <div className="generated-doc-toolbar no-print">

          {/* Back button navigates to previous page */}
          <button
            className="secondary-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          {/* Print button (disabled if no content available) */}
          <button
            className="primary-btn"
            onClick={handlePrint}
            disabled={!documentData?.contentHtml}
          >
            Print
          </button>
        </div>

        {/* Main container for document preview */}
        <div className="generated-doc-card">

          {/* Case 1: Still loading */}
          {loading ? (
            <p>Loading generated document...</p>

          /* Case 2: Document not found */
          ) : !documentData ? (
            <p>Generated document not found.</p>

          /* Case 3: Render document content */
          ) : (
            <>
              {/* Optional metadata section (currently commented out)
                  Useful for debugging or print headers */}
              {/*
              <div className="generated-doc-meta hide-on-screen">
                <h2>{documentData.templateLabel || "Generated Document"}</h2>
                <p><strong>File Name:</strong> {documentData.fileName || "-"}</p>
                <p><strong>Reference No:</strong> {documentData.referenceNo || "-"}</p>
                <p><strong>Res. Cert. No.:</strong> {documentData.resCertNo || "-"}</p>
                <p><strong>Fees Paid:</strong> {documentData.feesPaid ? `₱${documentData.feesPaid}.00` : "-"}</p>
                <p><strong>O.R. No.:</strong> {documentData.orNo || "-"}</p>
                <p><strong>Status:</strong> {documentData.status || "-"}</p>
              </div>
              */}

              {/* Render HTML content stored in database */}
              <div
                className="generated-doc-preview"
                dangerouslySetInnerHTML={{
                  // Inject HTML string (generated document template)
                  __html: documentData.contentHtml || "<p>No preview content available.</p>",
                }}
              />
            </>
          )}

        </div>
      </div>
    </StaffLayout>
  );
}