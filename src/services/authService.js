// Firebase Authentication function for password reset
import { sendPasswordResetEmail } from "firebase/auth";

// Firebase Authentication core functions
import {
  createUserWithEmailAndPassword, // Registers a new user
  signInWithEmailAndPassword,      // Logs in existing user
  signOut,                         // Logs out user
  onAuthStateChanged,             // Listens to auth state changes
} from "firebase/auth";

// Firestore database functions
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase instances (auth + database)
import { auth, db } from "../firebase/config";

// Centralized error handler utility
import { handleAppError } from "../utils/errorHandler";


// ==============================
// PASSWORD RESET FUNCTION
// ==============================

// Sends password reset email to staff account
export const forgotStaffPassword = async (email) => {
  try {

    // Validate input
    if (!email?.trim()) {
      return {
        success: false,
        message: "Please enter your email address first.",
      };
    }

    // Firebase password reset trigger
    await sendPasswordResetEmail(auth, email.trim());

    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    };

  } catch (error) {
    console.error("forgotStaffPassword error:", error);

    let message = "Failed to send password reset email.";

    // Firebase-specific error handling
    if (error.code === "auth/user-not-found") {
      message = "No staff account found with that email.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address.";
    }

    return {
      success: false,
      message,
    };
  }
};


// ==============================
// STAFF REGISTRATION
// ==============================

// Creates Firebase Auth user + Firestore profile
export const registerStaff = async ({
  fullName,
  email,
  password,
}) => {
  try {

    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    // Create corresponding Firestore user profile
    await setDoc(doc(db, "staffUsers", firebaseUser.uid), {
      uid: firebaseUser.uid,
      fullName: fullName.trim(),
      email: firebaseUser.email,

      // Role is assigned at creation (RBAC foundation)
      role: "staff",

      isActive: true,

      // Server-side timestamps ensure consistency
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

    // Centralized error handling improves maintainability
    return await handleAppError({
      error,
      source: "authService.registerStaff",
      metadata: { fullName, email },
      fallbackMessage: "Failed to register staff account.",
    });
  }
};


// ==============================
// STAFF LOGIN
// ==============================

// Authenticates user and validates Firestore profile
export const loginStaff = async (email, password) => {
  try {

    // Firebase authentication login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user profile from Firestore
    const staffRef = doc(db, "staffUsers", firebaseUser.uid);
    const staffSnap = await getDoc(staffRef);

    // Ensure user profile exists
    if (!staffSnap.exists()) {
      throw new Error("No staff profile found.");
    }

    const staffData = staffSnap.data();

    // Check if account is active (soft disable feature)
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


// ==============================
// LOGOUT FUNCTION
// ==============================

// Ends Firebase authentication session
export const logoutStaff = async () => {
  await signOut(auth);
};


// ==============================
// AUTH STATE SUBSCRIPTION
// ==============================

// Listens for login/logout changes in real time
// Used by AuthContext for global state management
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {

    // If user is logged out
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      // Fetch Firestore profile linked to Firebase Auth user
      const staffRef = doc(db, "staffUsers", firebaseUser.uid);
      const staffSnap = await getDoc(staffRef);

      // If no profile exists, treat as unauthenticated
      if (!staffSnap.exists()) {
        callback(null);
        return;
      }

      // Merge auth + Firestore profile
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...staffSnap.data(),
      });

    } catch (error) {
      console.error("Auth subscription error:", error);

      // Fail-safe: treat error as unauthenticated state
      callback(null);
    }
  });
};