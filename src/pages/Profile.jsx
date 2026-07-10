import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { ChevronRight, LogOut, ShieldCheck, FileText, Lock, Pencil, Check, X } from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { phone });
      await refreshProfile();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Profile</h1>

      <Card className="mb-4">
        <CardContent className="flex items-center gap-4 pt-4">
          <Avatar src={profile?.photoURL} name={profile?.name} size={56} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800">{profile?.name || "PulaTrack User"}</p>
            <p className="truncate text-sm text-slate-500">{profile?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4 space-y-3">
          <Row label="Country" value={profile?.country || "Botswana"} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Phone</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <Input
                  className="h-8 w-36 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+267 71 234 567"
                />
                <button onClick={handleSave} disabled={saving} className="p-1 text-income">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditing(false)} className="p-1 text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-sm font-medium text-slate-700"
              >
                {profile?.phone || "Add phone number"}
                <Pencil className="h-3 w-3 text-slate-400" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <NavRow icon={ShieldCheck} label="Security & App Lock" to="/security" />
        <NavRow icon={FileText} label="Terms and Conditions" to="/terms" />
        <NavRow icon={Lock} label="Privacy Policy" to="/privacy" />
      </div>

      <Button variant="outline" className="w-full text-destructive border-destructive" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Log Out
      </Button>

      <p className="mt-6 text-center text-xs text-slate-400">PulaTrack v1.0 · Made for 🇧🇼 Botswana</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function NavRow({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-0 hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5 text-primary" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </Link>
  );
}
