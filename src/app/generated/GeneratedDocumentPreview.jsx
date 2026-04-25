// src/app/generated/GeneratedDocumentPreview.jsx
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffLayout from "../../components/layout/StaffLayout";
import { db } from "../../firebase/config";
import "./GeneratedDocument.css";

export default function GeneratedDocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGeneratedDocument = async () => {
      try {
        setLoading(true);

        const ref = doc(db, "generatedDocuments", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setDocumentData(null);
          setLoading(false);
          return;
        }

        setDocumentData({
          id: snap.id,
          ...snap.data(),
        });
      } catch (error) {
        console.error("loadGeneratedDocument error:", error);
        setDocumentData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadGeneratedDocument();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <StaffLayout title="Generated Document Preview">
      <div className="generated-doc-page">
        <div className="generated-doc-toolbar no-print">
          <button
            className="secondary-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            className="primary-btn"
            onClick={handlePrint}
            disabled={!documentData?.contentHtml}
          >
            Print
          </button>
        </div>

        <div className="generated-doc-card">
          {loading ? (
            <p>Loading generated document...</p>
          ) : !documentData ? (
            <p>Generated document not found.</p>
          ) : (
            <>
             {/* <div className="generated-doc-meta hide-on-screen">
                <h2>{documentData.templateLabel || "Generated Document"}</h2>
                <p><strong>File Name:</strong> {documentData.fileName || "-"}</p>
                <p><strong>Reference No:</strong> {documentData.referenceNo || "-"}</p>
                <p><strong>Res. Cert. No.:</strong> {documentData.resCertNo || "-"}</p>
                <p><strong>Fees Paid:</strong> {documentData.feesPaid ? `₱${documentData.feesPaid}.00` : "-"}</p>
                <p><strong>O.R. No.:</strong> {documentData.orNo || "-"}</p>
                <p><strong>Status:</strong> {documentData.status || "-"}</p>
              </div> */}
              
              <div
                className="generated-doc-preview"
                dangerouslySetInnerHTML={{
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