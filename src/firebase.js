// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ADD THIS
import { getFirestore } from "firebase/firestore"; // ADD THIS

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

// EXPORT THESE 2 so App.jsx can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
