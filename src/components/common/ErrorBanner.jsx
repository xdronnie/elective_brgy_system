// Functional component for displaying error messages in a reusable banner
export default function ErrorBanner({ message }) {

  // If no message is provided, render nothing (prevents empty UI element)
  if (!message) return null;

  return (
    <div
      // Inline styles for quick visual feedback (can be moved to CSS for scalability)
      style={{
        padding: "12px",              // Space inside the banner
        marginBottom: "16px",         // Space below the banner
        borderRadius: "8px",          // Rounded corners
        backgroundColor: "#ffe5e5",   // Light red background (error indication)
        color: "#b00020",             // Dark red text (contrast)
        border: "1px solid #f5b5b5",  // Subtle border for separation
      }}
    >
      {/* Display the error message passed as a prop */}
      {message}
    </div>
  );
}