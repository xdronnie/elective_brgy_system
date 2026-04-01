// src/services/requestService.js
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { REQUEST_STATUS } from "../constants/requestStatus";
import { handleAppError } from "../utils/errorHandler";
import { createAuditLog } from "./auditService";
import { generateReferenceNumber } from "../utils/referenceNumber";
import { createNotification } from "./notificationService";
import { sendStatusUpdateEmail } from "./emailService";
export const createRequest = async ({ data, user = null }) => {
  try {
    const referenceNo = data.referenceNo || generateReferenceNumber();
    const fullName =
      data.fullName ||
      [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    const docRef = await addDoc(collection(db, "documentRequests"), {
      ...data,
      fullName,
      age: data.age === "" ? "" : Number(data.age || 0),
      referenceNo,
      status: REQUEST_STATUS.DRAFT,
      createdBy: user?.uid || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      action: "create_request",
      performedBy: user?.uid || null,
      performerRole: user?.role || "public",
      requestId: docRef.id,
      residentId: data.residentId || null,
      toStatus: REQUEST_STATUS.DRAFT,
      remarks: "Request created",
    });

    return {
      success: true,
      id: docRef.id,
      referenceNo,
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "requestService.createRequest",
      user,
      metadata: { data },
      fallbackMessage: "Failed to create request.",
    });
  }
};

export const updateRequestStatus = async ({
  requestId,
  newStatus,
  user,
  remarks = "",
  rejectionReason = "",





  
}) => {
  try {
    const requestRef = doc(db, "documentRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const oldData = requestSnap.data();
    const oldStatus = oldData.status;

    await updateDoc(requestRef, {
      status: newStatus,
      rejectionReason,
      updatedAt: serverTimestamp(),
      ...(newStatus === REQUEST_STATUS.APPROVED && {
        approvedBy: user?.uid || null,
        approvedAt: serverTimestamp(),
      }),
      ...(newStatus === REQUEST_STATUS.RELEASED && {
        releasedBy: user?.uid || null,
        releasedAt: serverTimestamp(),
      }),
    });

    let residentIdToSave = oldData.residentId || null;

    if (newStatus === REQUEST_STATUS.APPROVED && !residentIdToSave) {
      const existingResident = await findResidentMatch({
        ...oldData,
        id: requestId,
      });

      if (existingResident) {
        residentIdToSave = existingResident.id;
      } else {
        residentIdToSave = await createResidentFromRequest({
          requestData: {
            ...oldData,
            id: requestId,
          },
          user,
        });
      }

      await updateDoc(requestRef, {
        residentId: residentIdToSave,
        updatedAt: serverTimestamp(),
      });

      await createAuditLog({
        action: "create_resident_from_request",
        performedBy: user?.uid || null,
        performerRole: user?.role || null,
        requestId,
        residentId: residentIdToSave,
        fromStatus: oldStatus,
        toStatus: newStatus,
        remarks: "Resident record linked/created from approved request",
      });
    }

    await createAuditLog({
      action: "update_request_status",
      performedBy: user?.uid || null,
      performerRole: user?.role || null,
      requestId,
      residentId: residentIdToSave || oldData.residentId || null,
      fromStatus: oldStatus,
      toStatus: newStatus,
      remarks: remarks || rejectionReason || "Status updated",
    });

    if (newStatus === REQUEST_STATUS.READY_FOR_PICKUP) {
      await createNotification({
        user,
        data: {
          requestId,
          referenceNo: oldData.referenceNo || "",
          type: "ready_for_pickup",
          message: `Request ${oldData.referenceNo || requestId} is ready for pickup.`,
          recipientType: "staff",
        },
      });
    }
 const recipientEmail = String(oldData.email || "").trim();
console.log("Status email recipient:", recipientEmail);

if (recipientEmail) {
  try {
    await sendStatusUpdateEmail({
      to: recipientEmail,
      applicantName:
        oldData.fullName ||
        [oldData.firstName, oldData.middleName, oldData.lastName]
          .filter(Boolean)
          .join(" ")
          .trim(),
      referenceNo: oldData.referenceNo || "",
      documentType: oldData.documentType || "",
      status: newStatus,
      rejectionReason,
    });
  } catch (error) {
    console.error("Status update email failed:", error);
  }
} else {
  console.warn("Status update email skipped: request has no email.", {
    requestId,
    referenceNo: oldData.referenceNo || "",
    email: oldData.email,
  });
}

    return { success: true };
  } catch (error) {
    return await handleAppError({
      error,
      source: "requestService.updateRequestStatus",
      user,
      metadata: { requestId, newStatus, remarks, rejectionReason },
      fallbackMessage: "Failed to update request status.",
    });
  }
};

export const updateRequestDocumentSettings = async ({
  requestId,
  documentSettings,
  user,
}) => {
  try {
    const requestRef = doc(db, "documentRequests", requestId);

    await updateDoc(requestRef, {
      documentSettings,
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      action: "update_document_settings",
      performedBy: user?.uid || null,
      performerRole: user?.role || null,
      requestId,
      remarks: "Document settings updated",
    });

    return { success: true };
  } catch (error) {
    return await handleAppError({
      error,
      source: "requestService.updateRequestDocumentSettings",
      user,
      metadata: { requestId, documentSettings },
      fallbackMessage: "Failed to update document settings.",
    });
  }
};

export const getRequestById = async (requestId) => {
  try {
    const requestRef = doc(db, "documentRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) return null;

    return {
      id: requestSnap.id,
      ...requestSnap.data(),
    };
  } catch (error) {
    console.error("getRequestById error:", error);
    return null;
  }
};

export const getAllRequests = async () => {
  try {
    const q = query(
      collection(db, "documentRequests"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getAllRequests error:", error);
    return [];
  }
};

export const getRequestsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, "documentRequests"),
      where("status", "==", status)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getRequestsByStatus error:", error);
    return [];
  }
};

export const getRequestCounts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "documentRequests"));
    const counts = {
      total: 0,
      draft: 0,
      for_approval: 0,
      approved: 0,
      ready_for_pickup: 0,
      released: 0,
      rejected: 0,
    };

    snapshot.docs.forEach((docItem) => {
      const data = docItem.data();
      counts.total += 1;

      if (data.status && counts[data.status] !== undefined) {
        counts[data.status] += 1;
      }
    });

    return counts;
  } catch (error) {
    console.error("getRequestCounts error:", error);
    return {
      total: 0,
      draft: 0,
      for_approval: 0,
      approved: 0,
      ready_for_pickup: 0,
      released: 0,
      rejected: 0,
    };
  }
};

export const getRequestsByDocumentType = async (documentType) => {
  try {
    const q = query(
      collection(db, "documentRequests"),
      where("documentType", "==", documentType)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getRequestsByDocumentType error:", error);
    return [];
  }
};

export const getResidentRequests = async (residentId) => {
  try {
    const q = query(
      collection(db, "documentRequests"),
      where("residentId", "==", residentId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getResidentRequests error:", error);
    return [];
  }
};

const findResidentMatch = async (requestData) => {
  const fullName =
    requestData.fullName ||
    [requestData.firstName, requestData.middleName, requestData.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  const q = query(
    collection(db, "residents"),
    where("fullName", "==", fullName)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const matchedDoc = snapshot.docs[0];
  return {
    id: matchedDoc.id,
    ...matchedDoc.data(),
  };
};

const createResidentFromRequest = async ({ requestData, user }) => {
  const fullName =
    requestData.fullName ||
    [requestData.firstName, requestData.middleName, requestData.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

  const docRef = await addDoc(collection(db, "residents"), {
    firstName: requestData.firstName || "",
    middleName: requestData.middleName || "",
    lastName: requestData.lastName || "",
    suffix: requestData.suffix || "",
    fullName,
    sex: requestData.sex || "",
    age: requestData.age === "" ? "" : Number(requestData.age || 0),
    birthDate: requestData.birthDate || "",
    civilStatus: requestData.civilStatus || "",
    contactNumber: requestData.contactNumber || "",
    email: requestData.email || "",
    municipalityId: requestData.municipalityId || "",
    barangayId: requestData.barangayId || "",
    purok: requestData.purok || "",
    fullAddress: requestData.fullAddress || requestData.address || "",
    sourceRequestId: requestData.id || null,
    createdBy: user?.uid || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};
export const updatePublicRequest = async ({
  requestId,
  data,
}) => {
  try {
    const requestRef = doc(db, "documentRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const currentData = requestSnap.data();
    const currentStatus = currentData.status;

    const editableStatuses = [
      REQUEST_STATUS.DRAFT,
      REQUEST_STATUS.FOR_APPROVAL,
      REQUEST_STATUS.REJECTED,
    ];

    if (!editableStatuses.includes(currentStatus)) {
      throw new Error("This request can no longer be edited.");
    }

    const fullName =
      data.fullName ||
      [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    await updateDoc(requestRef, {
      ...data,
      fullName,
      age: data.age === "" ? "" : Number(data.age || 0),
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      action: "update_public_request",
      performedBy: null,
      performerRole: "public",
      requestId,
      residentId: currentData.residentId || null,
      fromStatus: currentStatus,
      toStatus: currentStatus,
      remarks: "Public request updated by requester",
    });

    return { success: true };
  } catch (error) {
    return await handleAppError({
      error,
      source: "requestService.updatePublicRequest",
      metadata: { requestId, data },
      fallbackMessage: "Failed to update request.",
    });
  }
};

export const resubmitRequest = async (requestId) => {
  try {
    const requestRef = doc(db, "documentRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Request not found.");
    }

    const currentData = requestSnap.data();

    if (currentData.status !== REQUEST_STATUS.REJECTED) {
      throw new Error("Only rejected requests can be resubmitted.");
    }

    await updateDoc(requestRef, {
      status: REQUEST_STATUS.FOR_APPROVAL,
      rejectionReason: "",
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      action: "resubmit_request",
      performedBy: null,
      performerRole: "public",
      requestId,
      residentId: currentData.residentId || null,
      fromStatus: REQUEST_STATUS.REJECTED,
      toStatus: REQUEST_STATUS.FOR_APPROVAL,
      remarks: "Request resubmitted by requester",
    });

    return { success: true };
  } catch (error) {
    return await handleAppError({
      error,
      source: "requestService.resubmitRequest",
      metadata: { requestId },
      fallbackMessage: "Failed to resubmit request.",
    });
  }
};