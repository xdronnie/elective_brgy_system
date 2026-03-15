// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { handleAppError } from "../utils/errorHandler";

export const registerStaff = async ({
  fullName,
  email,
  password,
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    await setDoc(doc(db, "staffUsers", firebaseUser.uid), {
      uid: firebaseUser.uid,
      fullName: fullName.trim(),
      email: firebaseUser.email,
      role: "staff",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: fullName.trim(),
        role: "staff",
        isActive: true,
      },
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "authService.registerStaff",
      metadata: { fullName, email },
      fallbackMessage: "Failed to register staff account.",
    });
  }
};

export const loginStaff = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const staffRef = doc(db, "staffUsers", firebaseUser.uid);
    const staffSnap = await getDoc(staffRef);

    if (!staffSnap.exists()) {
      throw new Error("No staff profile found.");
    }

    const staffData = staffSnap.data();

    if (!staffData.isActive) {
      throw new Error("This account is inactive.");
    }

    return {
      success: true,
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...staffData,
      },
    };
  } catch (error) {
    return await handleAppError({
      error,
      source: "authService.loginStaff",
      metadata: { email },
      fallbackMessage: "Failed to log in.",
    });
  }
};

export const logoutStaff = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const staffRef = doc(db, "staffUsers", firebaseUser.uid);
      const staffSnap = await getDoc(staffRef);

      if (!staffSnap.exists()) {
        callback(null);
        return;
      }

      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...staffSnap.data(),
      });
    } catch (error) {
      console.error("Auth subscription error:", error);
      callback(null);
    }
  });
};