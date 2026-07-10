import React, { createContext, useContext, useEffect, useState } from "react";
import { hashPin } from "@/lib/utils";

const AppLockContext = createContext(null);

const PIN_HASH_KEY = "pulatrack_pin_hash";
const BIOMETRIC_KEY = "pulatrack_biometric_enabled";
const UNLOCKED_KEY = "pulatrack_unlocked"; // sessionStorage — cleared on tab close
const IDLE_LOCK_MS = 5 * 60 * 1000; // 5 minutes idle -> re-lock

export function AppLockProvider({ children }) {
  const [hasPin, setHasPin] = useState(!!localStorage.getItem(PIN_HASH_KEY));
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem(BIOMETRIC_KEY) === "true"
  );
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(UNLOCKED_KEY) === "true");

  // ---- Re-lock after 5 minutes of inactivity ----
  useEffect(() => {
    if (!unlocked || !hasPin) return;
    let idleTimer;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => lock(), IDLE_LOCK_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    resetIdle();
    return () => {
      clearTimeout(idleTimer);
      events.forEach((e) => window.removeEventListener(e, resetIdle));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, hasPin]);

  async function setPin(pin) {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hash);
    setHasPin(true);
    unlock();
  }

  async function verifyPin(pin) {
    const hash = await hashPin(pin);
    const stored = localStorage.getItem(PIN_HASH_KEY);
    const ok = hash === stored;
    if (ok) unlock();
    return ok;
  }

  function removePin() {
    localStorage.removeItem(PIN_HASH_KEY);
    localStorage.removeItem(BIOMETRIC_KEY);
    setHasPin(false);
    setBiometricEnabled(false);
  }

  function unlock() {
    sessionStorage.setItem(UNLOCKED_KEY, "true");
    setUnlocked(true);
  }

  function lock() {
    sessionStorage.removeItem(UNLOCKED_KEY);
    setUnlocked(false);
  }

  // ---- WebAuthn biometric unlock (Face ID / Touch ID / Windows Hello) ----
  // Uses a simple platform-authenticator check; a real production app should
  // register a proper credential server-side. This gives a working local demo.
  async function isBiometricAvailable() {
    if (!window.PublicKeyCredential) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  async function enableBiometric() {
    const available = await isBiometricAvailable();
    if (!available) throw new Error("Biometric authentication is not available on this device.");
    localStorage.setItem(BIOMETRIC_KEY, "true");
    setBiometricEnabled(true);
  }

  function disableBiometric() {
    localStorage.removeItem(BIOMETRIC_KEY);
    setBiometricEnabled(false);
  }

  async function unlockWithBiometric() {
    try {
      // Trigger the platform authenticator UI. In production you'd verify a
      // real credential/assertion against a server-stored public key.
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: "required",
          timeout: 60000,
        },
      });
      unlock();
      return true;
    } catch (e) {
      console.error("Biometric unlock failed:", e);
      return false;
    }
  }

  const value = {
    hasPin,
    unlocked,
    biometricEnabled,
    setPin,
    verifyPin,
    removePin,
    lock,
    unlock,
    isBiometricAvailable,
    enableBiometric,
    disableBiometric,
    unlockWithBiometric,
  };

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error("useAppLock must be used within an AppLockProvider");
  return ctx;
}

export default AppLockContext;
