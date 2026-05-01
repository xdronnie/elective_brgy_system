import { db } from "./firebase/config";

/**
 * Temporary test component to verify Firebase Firestore connection.
 * Logs the initialized Firestore instance to confirm setup is working.
 */
function App() {
  console.log("Firestore connected:", db);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Barangay Management System</h1>
      <p>React + Firebase setup successful.</p>
    </div>
  );
}

export default App;