import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase";
import { generateDummyData } from "@/lib/dummyData";
import { deleteAllUserData } from "@/lib/deleteUserData";

const AuthContext = createContext(null);

// 15 minutes, in ms — auto logout on inactivity (Feature: Session timeout)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  // ---- Load / watch the Firebase auth user + their Firestore profile ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ---- Inactivity-based session timeout (auto logout after 15 min) ----
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT_MS);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- Actions ----

  async function signup({ name, email, password, acceptedTOS }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const profileData = {
      name,
      email,
      photoURL: "",
      phone: "",
      country: "Botswana",
      twoFAEnabled: false,
      acceptedTOS: !!acceptedTOS,
      acceptedTOSDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profileData);
    setProfile(profileData);

    // Seed demo data so the new user sees a populated dashboard immediately
    try {
      await generateDummyData(cred.user.uid);
    } catch (e) {
      console.error("Failed to generate dummy data:", e);
    }

    return cred.user;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref = doc(db, "users", cred.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First time Google sign-in — create their profile doc + demo data
      const profileData = {
        name: cred.user.displayName || "",
        email: cred.user.email || "",
        photoURL: cred.user.photoURL || "",
        phone: "",
        country: "Botswana",
        twoFAEnabled: false,
        acceptedTOS: true,
        acceptedTOSDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, profileData);
      setProfile(profileData);
      try {
        await generateDummyData(cred.user.uid);
      } catch (e) {
        console.error("Failed to generate dummy data:", e);
      }
    } else {
      setProfile(snap.data());
    }
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
    // Clear the app lock so the next login always shows PIN setup fresh
    sessionStorage.removeItem("pulatrack_unlocked");
  }

  async function refreshProfile() {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setProfile(snap.data());
  }

  // ---- Account deletion ----
  // Firebase requires a "recent login" before allowing account deletion, so
  // we reauthenticate first (password re-entry for email accounts, a fresh
  // Google popup for Google accounts), wipe all Firestore data, then delete
  // the Auth user itself. This is irreversible.
  async function deleteAccount({ password } = {}) {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const currentUser = auth.currentUser;
    const providerId = currentUser.providerData[0]?.providerId;

    // 1. Reauthenticate (required by Firebase for sensitive operations)
    if (providerId === "google.com") {
      await reauthenticateWithPopup(currentUser, googleProvider);
    } else {
      if (!password) throw new Error("Please enter your password to confirm deletion.");
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
    }

    // 2. Wipe all Firestore data (transactions, budgets, goals, profile doc)
    await deleteAllUserData(currentUser.uid);

    // 3. Delete the Firebase Auth account itself
    await deleteUser(currentUser);

    // 4. Clear any local app-lock / session state tied to this device
    localStorage.removeItem("pulatrack_pin_hash");
    localStorage.removeItem("pulatrack_biometric_enabled");
    sessionStorage.removeItem("pulatrack_unlocked");

    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
