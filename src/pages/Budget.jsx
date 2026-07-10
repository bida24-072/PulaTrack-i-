import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { Plus, PiggyBank } from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import BudgetItem from "@/components/BudgetItem";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { EXPENSE_CATEGORIES, currentMonthKey, monthKeyOf } from "@/lib/utils";

export default function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: "" });

  const monthKey = currentMonthKey();

  useEffect(() => {
    if (!user) return;
    const unsubBudgets = onSnapshot(
      query(collection(db, "users", user.uid, "budgets")),
      (snap) => {
        setBudgets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubTx = onSnapshot(query(collection(db, "users", user.uid, "transactions")), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubBudgets();
      unsubTx();
    };
  }, [user]);

  // Only show budgets for the current month
  const thisMonthBudgets = useMemo(
    () => budgets.filter((b) => b.monthKey === monthKey),
    [budgets, monthKey]
  );

  const spentByCategory = useMemo(() => {
    const totals = {};
    transactions
      .filter((t) => t.type === "Expense" && monthKeyOf(t.date) === monthKey)
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });
    return totals;
  }, [transactions, monthKey]);

  function openAdd() {
    setEditing(null);
    setForm({ category: EXPENSE_CATEGORIES[0], amount: "" });
    setFormOpen(true);
  }

  function openEdit(budget) {
    setEditing(budget);
    setForm({ category: budget.category, amount: String(budget.amount) });
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    const now = new Date();
    const data = {
      category: form.category,
      amount: Number(form.amount),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthKey,
    };
    if (editing) {
      await updateDoc(doc(db, "users", user.uid, "budgets", editing.id), data);
    } else {
      await addDoc(collection(db, "users", user.uid, "budgets"), data);
    }
    setFormOpen(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", user.uid, "budgets", id));
  }

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Budget</h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Set Budget
        </Button>
      </header>

      {thisMonthBudgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set for this month"
          description="Set a spending limit per category to stay on track."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Set Budget
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {thisMonthBudgets.map((b) => (
            <BudgetItem
              key={b.id}
              budget={b}
              spent={spentByCategory[b.category] || 0}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Budget" : "Set Budget"}</DialogTitle>
            <DialogClose onClick={() => setFormOpen(false)} />
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="b-category">Category</Label>
              <Select
                id="b-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                disabled={!!editing}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="b-amount">Monthly Budget (P)</Label>
              <Input
                id="b-amount"
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
            <Button type="submit" className="w-full">
              {editing ? "Save Changes" : "Set Budget"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
