// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTc2-BWZQvXGpIeILVCff_0-WAYPUlJoc",
  authDomain: "brgy-system-aab8c.firebaseapp.com",
  projectId: "brgy-system-aab8c",
  storageBucket: "brgy-system-aab8c.appspot.com",
  messagingSenderId: "214492008418",
  appId: "1:214492008418:web:821048457125e693e833bb",
  measurementId: "G-Y39P698X2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;