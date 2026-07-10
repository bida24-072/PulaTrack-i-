// src/firebase.js
// -----------------------------------------------------------------------
// Firebase v9 (modular SDK) setup for PulaTrack.
// -----------------------------------------------------------------------
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4DdDN1Uq1r3SkZ0mTHZIqnab5LHagHmY",
  authDomain: "pulatrack-bw.firebaseapp.com",
  projectId: "pulatrack-bw",
  storageBucket: "pulatrack-bw.firebasestorage.app",
  messagingSenderId: "914761828833",
  appId: "1:914761828833:web:79b7e42247535264a56aa0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Firestore instances used throughout the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Keep the user logged in across page refreshes
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Firebase persistence error:", err);
});

export default app;
