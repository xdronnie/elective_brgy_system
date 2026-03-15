import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export const logErrorToFirestore = async ({
  error,
  source = "unknown",
  user = null,
  metadata = {},
}) => {
  try {
    await addDoc(collection(db, "errorLogs"), {
      source,
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      code: error?.code || "",
      userId: user?.uid || null,
      userRole: user?.role || null,
      metadata,
      createdAt: serverTimestamp(),
    });
  } catch (logError) {
    console.error("Failed to save error log:", logError);
  }
};