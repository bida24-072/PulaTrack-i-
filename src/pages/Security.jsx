import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import {
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLock } from "@/contexts/AppLockContext";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function Security() {
  const { user, profile, refreshProfile, deleteAccount, logout } = useAuth();
  const { hasPin, setPin, removePin, biometricEnabled, enableBiometric, disableBiometric, isBiometricAvailable } =
    useAppLock();
  const navigate = useNavigate();

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [bioError, setBioError] = useState("");
  const [saving2FA, setSaving2FA] = useState(false);

  // Account deletion state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1 = warning, 2 = confirm
  const [confirmText, setConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";
  const canConfirmDelete =
    confirmText.trim().toUpperCase() === "DELETE" && (isGoogleUser || deletePassword.length > 0);

  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setDeleteStep(1);
    setConfirmText("");
    setDeletePassword("");
    setDeleteError("");
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount({ password: deletePassword });
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(mapDeleteError(err));
      setDeleting(false);
    }
  }

  async function toggle2FA(checked) {
    setSaving2FA(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { twoFAEnabled: checked });
      await refreshProfile();
    } finally {
      setSaving2FA(false);
    }
  }

  async function handleSetPin(e) {
    e.preventDefault();
    setPinError("");
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match.");
      return;
    }
    await setPin(newPin);
    setPinDialogOpen(false);
    setNewPin("");
    setConfirmPin("");
  }

  async function toggleBiometric(checked) {
    setBioError("");
    try {
      if (checked) {
        await enableBiometric();
      } else {
        disableBiometric();
      }
    } catch (err) {
      setBioError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <header className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Security & App Lock</h1>
      </header>

      {/* 2-Step Verification */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-slate-800">2-Step Verification</p>
                <p className="text-xs text-slate-500">
                  Add an extra layer of security using an authenticator app like Google
                  Authenticator.
                </p>
              </div>
            </div>
            <Switch checked={!!profile?.twoFAEnabled} onCheckedChange={toggle2FA} disabled={saving2FA} />
          </div>
          {profile?.twoFAEnabled && (
            <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-slate-600">
              Scan a QR code in your Google Authenticator app to link this account. (TOTP
              enrollment requires a backend/Cloud Function to generate and verify secrets —
              wire this up to your own server endpoint in production.)
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Lock (PIN) */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-slate-800">App Lock PIN</p>
                <p className="text-xs text-slate-500">
                  Require a 4-digit PIN to open PulaTrack or after 5 minutes idle.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPinDialogOpen(true)}>
              {hasPin ? "Change PIN" : "Set Up PIN"}
            </Button>
            {hasPin && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={removePin}>
                Turn Off PIN Lock
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biometric unlock */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Fingerprint className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-slate-800">Biometric Unlock</p>
                <p className="text-xs text-slate-500">
                  Use Face ID, Touch ID, or Windows Hello via WebAuthn instead of your PIN.
                </p>
              </div>
            </div>
            <Switch checked={biometricEnabled} onCheckedChange={toggleBiometric} disabled={!hasPin} />
          </div>
          {!hasPin && (
            <p className="mt-2 text-xs text-amber-600">Set up a PIN first to enable biometric unlock.</p>
          )}
          {bioError && <p className="mt-2 text-xs text-destructive">{bioError}</p>}
        </CardContent>
      </Card>

      <p className="px-1 text-xs text-slate-400">
        Sessions automatically log out after 15 minutes of inactivity for your security.
      </p>

      {/* Danger Zone: Account Deletion */}
      <Card className="mt-4 border-destructive/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-slate-800">Delete Account</p>
              <p className="text-xs text-slate-500">
                Permanently delete your account and all data — transactions, budgets, and
                savings goals. This cannot be undone.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="mt-3"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete account confirmation dialog (2-step) */}
      <Dialog open={deleteDialogOpen} onOpenChange={(v) => !v && closeDeleteDialog()}>
        <DialogContent>
          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete your account?</DialogTitle>
                <DialogClose onClick={closeDeleteDialog} />
              </DialogHeader>
              <div className="space-y-3 text-sm text-slate-600">
                <p>This will permanently delete:</p>
                <ul className="list-inside list-disc space-y-1 text-slate-600">
                  <li>Your profile (name, email, phone)</li>
                  <li>Every transaction you've recorded</li>
                  <li>All budgets and savings goals</li>
                  <li>Your app lock PIN and security settings on this device</li>
                </ul>
                <p className="font-medium text-destructive">This action cannot be undone.</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDeleteDialog}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setDeleteStep(2)}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Confirm deletion</DialogTitle>
                <DialogClose onClick={closeDeleteDialog} />
              </DialogHeader>

              {deleteError && (
                <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                {!isGoogleUser && (
                  <div>
                    <Label htmlFor="delete-password">Confirm your password</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      placeholder="Your current password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                {isGoogleUser && (
                  <p className="text-xs text-slate-500">
                    You signed in with Google — clicking below will ask you to confirm via a
                    Google sign-in prompt.
                  </p>
                )}

                <div>
                  <Label htmlFor="delete-confirm">
                    Type <span className="font-semibold text-destructive">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    placeholder="DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={!canConfirmDelete || deleting}
                >
                  {deleting ? "Deleting account..." : "Permanently Delete My Account"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Set / change PIN dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasPin ? "Change PIN" : "Set Up PIN"}</DialogTitle>
            <DialogClose onClick={() => setPinDialogOpen(false)} />
          </DialogHeader>
          {pinError && (
            <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {pinError}
            </div>
          )}
          <form onSubmit={handleSetPin} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="New 4-digit PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              required
            />
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              required
            />
            <Button type="submit" className="w-full">
              Save PIN
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function mapDeleteError(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Incorrect password. Please try again.";
  }
  if (code.includes("popup-closed-by-user")) {
    return "Google confirmation was cancelled.";
  }
  if (code.includes("requires-recent-login")) {
    return "For security, please log out and log back in, then try deleting your account again.";
  }
  return err?.message || "Something went wrong while deleting your account. Please try again.";
}
