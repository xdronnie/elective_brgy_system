// Firestore functions for database interaction
import {
  addDoc,        // Create new document in collection
  collection,    // Reference Firestore collection
  getDocs,       // Fetch multiple documents
  orderBy,       // Sort query results
  query,         // Build Firestore query
  serverTimestamp,// Server-side timestamp for consistency
  where,         // Filtering query conditions
} from "firebase/firestore";

// Firebase database instance
import { db } from "../firebase/config";

// Centralized error handler utility
import { handleAppError } from "../utils/errorHandler";


// ==============================
// CREATE NOTIFICATION
// ==============================

// Creates a new notification entry in Firestore
// Used for system alerts (request updates, approvals, etc.)
export const createNotification = async ({ data, user = null }) => {
  try {

    // Insert notification document
    const docRef = await addDoc(collection(db, "notifications"), {

      // Spread dynamic notification payload (title, message, type, etc.)
      ...data,

      // Default unread state
      isRead: false,

      // Server timestamp ensures consistent ordering
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };

  } catch (error) {

    // Centralized error handling improves consistency across services
    return await handleAppError({
      error,
      source: "notificationService.createNotification",
      user,
      metadata: { data },
      fallbackMessage: "Failed to create notification.",
    });
  }
};


// ==============================
// GET ALL NOTIFICATIONS
// ==============================

// Retrieves all notifications sorted by newest first
export const getNotifications = async () => {
  try {

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

  } catch (error) {
    console.error("getNotifications error:", error);
    return [];
  }
};


// ==============================
// GET UNREAD NOTIFICATIONS
// ==============================

// Fetches only unread notifications for badge counters / alerts
export const getUnreadNotifications = async () => {
  try {

    const q = query(
      collection(db, "notifications"),
      where("isRead", "==", false)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

  } catch (error) {
    console.error("getUnreadNotifications error:", error);
    return [];
  }
};