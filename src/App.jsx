import { db } from "./firebase/config";

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