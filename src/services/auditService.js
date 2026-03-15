// src/services/auditService.js
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const createAuditLog = async ({
  action,
  performedBy = null,
  performerRole = null,
  requestId = null,
  residentId = null,
  fromStatus = null,
  toStatus = null,
  remarks = "",
}) => {
  await addDoc(collection(db, "auditLogs"), {
    action,
    performedBy,
    performerRole,
    requestId,
    residentId,
    fromStatus,
    toStatus,
    remarks,
    createdAt: serverTimestamp(),
  });
};

export const getAuditLogs = async () => {
  try {
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getAuditLogs error:", error);
    return [];
  }
};