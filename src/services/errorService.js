// Firestore functions for database operations
import {
  addDoc,            // Creates a new document in a collection
  collection,        // References a Firestore collection
  serverTimestamp,   // Generates consistent server-side timestamp
} from "firebase/firestore";

// Firebase database instance
import { db } from "../firebase/config";


// ==============================
// ERROR LOGGING SERVICE
// ==============================

// Centralized function for recording application errors into Firestore
// This enables monitoring, debugging, and historical error tracking
export const logErrorToFirestore = async ({
  error,        // actual error object thrown in application
  source = "unknown", // where the error originated (service, module, function)
  user = null,  // optional user context (who triggered the error)
  metadata = {}, // additional debugging context (inputs, state, etc.)
}) => {
  try {

    // Store error details in Firestore "errorLogs" collection
    await addDoc(collection(db, "errorLogs"), {

      source, // identifies system module where error occurred

      // Core error message (fallback ensures no undefined values)
      message: error?.message || "Unknown error",

      // Stack trace for debugging (useful during development)
      stack: error?.stack || "",

      // Firebase or system error code (if available)
      code: error?.code || "",

      // User context (helps trace user-specific issues)
      userId: user?.uid || null,
      userRole: user?.role || null,

      // Additional structured debug data
      metadata,

      // Server-generated timestamp ensures accurate ordering
      createdAt: serverTimestamp(),
    });

  } catch (logError) {

    // If logging itself fails, fallback to console (prevents crash loop)
    console.error("Failed to save error log:", logError);
  }
};