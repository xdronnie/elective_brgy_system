// src/services/auditService.js

// Firestore functions for database operations
import {
  addDoc,        // Adds a new document to a collection
  collection,    // References a Firestore collection
  getDocs,       // Retrieves documents from a collection/query
  orderBy,       // Used for sorting query results
  query,         // Builds structured Firestore queries
  serverTimestamp, // Generates server-side timestamp (avoids client time mismatch)
} from "firebase/firestore";

// Firebase database instance
import { db } from "../firebase/config";


// ==============================
// CREATE AUDIT LOG ENTRY
// ==============================

// Logs system activities (create/update/approve/reject actions)
// This is essential for traceability and accountability in the system
export const createAuditLog = async ({
  action,              // Description of action performed (e.g., "APPROVED_REQUEST")
  performedBy = null,  // User ID or name who performed the action
  performerRole = null,// Role of the user (admin, encoder, etc.)
  requestId = null,    // Related request (if applicable)
  residentId = null,   // Related resident (if applicable)
  fromStatus = null,   // Previous state (for tracking transitions)
  toStatus = null,     // New state after action
  remarks = "",        // Optional notes or explanation
}) => {

  // Store audit log in Firestore
  await addDoc(collection(db, "auditLogs"), {

    action,
    performedBy,
    performerRole,
    requestId,
    residentId,
    fromStatus,
    toStatus,
    remarks,

    // Server-generated timestamp ensures consistent time tracking
    createdAt: serverTimestamp(),
  });
};


// ==============================
// FETCH AUDIT LOGS
// ==============================

// Retrieves all audit logs sorted by newest first
export const getAuditLogs = async () => {
  try {

    // Build query: fetch from auditLogs collection sorted by createdAt DESC
    const q = query(
      collection(db, "auditLogs"),
      orderBy("createdAt", "desc")
    );

    // Execute query
    const snapshot = await getDocs(q);

    // Map Firestore documents into usable JS objects
    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

  } catch (error) {
    // Error handling ensures system doesn't crash on fetch failure
    console.error("getAuditLogs error:", error);

    // Return empty array as safe fallback
    return [];
  }
};