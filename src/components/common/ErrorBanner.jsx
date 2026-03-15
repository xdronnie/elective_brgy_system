// src/components/common/ErrorBanner.jsx
export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        padding: "12px",
        marginBottom: "16px",
        borderRadius: "8px",
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        border: "1px solid #f5b5b5",
      }}
    >
      {message}
    </div>
  );
}