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

export const createResident = async ({ data, user = null }) => {
  try {
    const fullName =
      data.fullName ||
      [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    const docRef = await addDoc(collection(db, "residents"), {
      ...data,
      fullName,
      age: data.age ? Number(data.age) : "",
      createdBy: user?.uid || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "residentService.createResident",
      user,
      metadata: { data },
      fallbackMessage: "Failed to create resident.",
    });
  }
};

export const getAllResidents = async () => {
  try {
    const q = query(collection(db, "residents"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("getAllResidents error:", error);
    return [];
  }
};

export const searchResidentsByLastName = async (lastName) => {
  try {
    const q = query(
      collection(db, "residents"),
      where("lastName", ">=", lastName),
      where("lastName", "<=", lastName + "\uf8ff")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("searchResidentsByLastName error:", error);
    return [];
  }
};