import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must accept the Terms and Conditions and Privacy Policy.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        acceptedTOS: true,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary to-[#0a3947] px-6 py-10">
      <div className="mb-6 flex flex-col items-center gap-2 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary shadow-lg">
          <Landmark className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">PulaTrack</h1>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Create your account</h2>
        <p className="mb-5 text-sm text-slate-500">Start tracking your Pula today</p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Kagiso Molefe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>

          <label className="flex items-start gap-2 pt-1 text-xs text-slate-500">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" target="_blank" className="text-primary underline">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists.";
  if (code.includes("weak-password")) return "Please choose a stronger password.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  return err?.message || "Something went wrong. Please try again.";
}
