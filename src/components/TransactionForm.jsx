import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/utils";

const emptyForm = {
  type: "Expense",
  amount: "",
  category: EXPENSE_CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

// Modal form for adding or editing a transaction.
// Pass `initialData` (existing transaction) to edit, or omit to add new.
export default function TransactionForm({ open, onOpenChange, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        amount: String(initialData.amount),
        category: initialData.category,
        date: (initialData.date || "").slice(0, 10),
        note: initialData.note || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  const categories = form.type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(type) {
    const cats = type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((f) => ({ ...f, type, category: cats[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        date: new Date(form.date).toISOString(),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Expense", "Income"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                    form.type === t
                      ? t === "Income"
                        ? "border-income bg-income/10 text-income"
                        : "border-expense bg-expense/10 text-expense"
                      : "border-slate-300 text-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (P)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Groceries at Choppies"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
