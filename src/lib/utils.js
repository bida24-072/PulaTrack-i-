import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely (used by every shadcn-style ui component)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format a number as Botswana Pula, e.g. formatPula(1234.5) -> "P 1,234.50"
export function formatPula(amount) {
  const value = Number(amount) || 0;
  return `P ${value.toLocaleString("en-BW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format a Date/ISO string as "07 Jul 2026"
export function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Return the current month key, e.g. "2026-07"
export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Return month key for an arbitrary date
export function monthKeyOf(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Simple, non-cryptographic hash used ONLY to obscure the app-lock PIN in
// localStorage. This is NOT a substitute for real backend auth security —
// it just stops the PIN being stored in plain text on the device.
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`pulatrack-salt-${pin}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const INCOME_CATEGORIES = ["Salary", "Business", "Gift", "Other"];
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Airtime/Data",
  "Shopping",
  "Bills",
  "Other",
];

export const CATEGORY_COLORS = {
  Salary: "#1E8E5A",
  Business: "#2E9E6C",
  Gift: "#D4AF37",
  Food: "#C0392B",
  Transport: "#E67E22",
  Rent: "#8E44AD",
  "Airtime/Data": "#2980B9",
  Shopping: "#D35400",
  Bills: "#16A085",
  Other: "#7F8C8D",
};
