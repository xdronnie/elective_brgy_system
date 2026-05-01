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


// =====================================
// CREATE RESIDENT RECORD
// =====================================

// Inserts a new resident document into Firestore
export const createResident = async ({ data, user = null }) => {
  try {

    // Normalize full name to ensure consistency in database
    const fullName =
      data.fullName ||
      [data.firstName, data.middleName, data.lastName]
        .filter(Boolean) // removes empty/null values
        .join(" ")
        .trim();

    // Add document to Firestore "residents" collection
    const docRef = await addDoc(collection(db, "residents"), {
      ...data,

      // Ensured computed field
      fullName,

      // Normalize numeric type (important for filtering/sorting)
      age: data.age ? Number(data.age) : "",

      // Audit trail fields
      createdBy: user?.uid || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };

  } catch (error) {

    // Centralized error handling for consistent logging and response formatting
    return await handleAppError({
      error,
      source: "residentService.createResident",
      user,
      metadata: { data },
      fallbackMessage: "Failed to create resident.",
    });
  }
};


// =====================================
// GET ALL RESIDENTS
// =====================================

// Retrieves all residents ordered by newest first
export const getAllResidents = async () => {
  try {

    const q = query(
      collection(db, "residents"),
      orderBy("createdAt", "desc")
    );

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


// =====================================
// SEARCH RESIDENTS BY LAST NAME
// =====================================

// Uses Firestore range query for prefix-based search
export const searchResidentsByLastName = async (lastName) => {
  try {

    const q = query(
      collection(db, "residents"),

      // Firestore "startsWith" pattern using range queries
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