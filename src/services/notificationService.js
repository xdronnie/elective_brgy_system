// src/services/notificationService.js
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { handleAppError } from "../utils/errorHandler";

export const createNotification = async ({ data, user = null }) => {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "notificationService.createNotification",
      user,
      metadata: { data },
      fallbackMessage: "Failed to create notification.",
    });
  }
};

export const getNotifications = async () => {
  try {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
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