import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Fingerprint, Delete, LogOut } from "lucide-react";
import { useAppLock } from "@/contexts/AppLockContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Lock() {
  const { hasPin, unlocked, verifyPin, biometricEnabled, unlockWithBiometric } = useAppLock();
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  // If there's no PIN configured, or already unlocked, skip this screen
  if (!hasPin || unlocked) {
    return <Navigate to={redirectTo} replace />;
  }

  useEffect(() => {
    if (pin.length === 4) {
      (async () => {
        const ok = await verifyPin(pin);
        if (ok) {
          navigate(redirectTo, { replace: true });
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
          }, 500);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function press(digit) {
    if (pin.length < 4) setPin((p) => p + digit);
  }
  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  async function handleBiometric() {
    const ok = await unlockWithBiometric();
    if (ok) navigate(redirectTo, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-white">
      <div className="mb-8 text-center">
        <p className="text-sm text-white/60">Welcome back</p>
        <h1 className="text-xl font-semibold">{profile?.name || "PulaTrack"}</h1>
        <p className="mt-1 text-sm text-white/60">Enter your 4-digit PIN</p>
      </div>

      <div className={`mb-8 flex gap-4 ${error ? "animate-pulse" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-accent ${
              i < pin.length ? "bg-accent" : "bg-transparent"
            } ${error ? "border-destructive bg-destructive" : ""}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => press(String(n))}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xl font-medium hover:bg-white/20 active:scale-95"
          >
            {n}
          </button>
        ))}

        {biometricEnabled ? (
          <button
            onClick={handleBiometric}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Use biometric unlock"
          >
            <Fingerprint className="h-6 w-6 text-accent" />
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => press("0")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xl font-medium hover:bg-white/20 active:scale-95"
        >
          0
        </button>

        <button
          onClick={backspace}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Backspace"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={() => logout().then(() => navigate("/login", { replace: true }))}
        className="mt-10 flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Log out instead
      </button>
    </div>
  );
}
