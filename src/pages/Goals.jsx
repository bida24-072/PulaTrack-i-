import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { Plus, Target } from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import GoalItem from "@/components/GoalItem";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";

const ICONS = ["Target", "Smartphone", "Car", "Home", "Plane", "GraduationCap", "ShieldCheck", "Heart", "Laptop"];

const emptyForm = { title: "", targetAmount: "", currentAmount: "0", deadline: "", icon: "Target" };

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [addMoneyGoal, setAddMoneyGoal] = useState(null);
  const [addAmount, setAddAmount] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "goals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(goal) {
    setEditing(goal);
    setForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      deadline: (goal.deadline || "").slice(0, 10),
      icon: goal.icon || "Target",
    });
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.targetAmount) return;
    const data = {
      title: form.title,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : "",
      icon: form.icon,
    };
    if (editing) {
      await updateDoc(doc(db, "users", user.uid, "goals", editing.id), data);
    } else {
      await addDoc(collection(db, "users", user.uid, "goals"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    }
    setFormOpen(false);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", user.uid, "goals", id));
  }

  async function handleAddMoney(e) {
    e.preventDefault();
    if (!addAmount || Number(addAmount) <= 0) return;
    const newAmount = (addMoneyGoal.currentAmount || 0) + Number(addAmount);
    await updateDoc(doc(db, "users", user.uid, "goals", addMoneyGoal.id), {
      currentAmount: newAmount,
    });
    setAddMoneyGoal(null);
    setAddAmount("");
  }

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Savings Goals</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </header>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals yet"
          description='Create a goal like "New Phone P8000" to start saving with purpose.'
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalItem
              key={g.id}
              goal={g}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAddMoney={setAddMoneyGoal}
            />
          ))}
        </div>
      )}

      {/* Create / edit goal dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Goal" : "New Savings Goal"}</DialogTitle>
            <DialogClose onClick={() => setFormOpen(false)} />
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="g-title">Goal Title</Label>
              <Input
                id="g-title"
                placeholder="e.g. New Phone"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="g-target">Target Amount (P)</Label>
              <Input
                id="g-target"
                type="number"
                min="0"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="g-current">Current Amount (P)</Label>
              <Input
                id="g-current"
                type="number"
                min="0"
                step="0.01"
                value={form.currentAmount}
                onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="g-deadline">Deadline (optional)</Label>
              <Input
                id="g-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="g-icon">Icon</Label>
              <Select
                id="g-icon"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              >
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {editing ? "Save Changes" : "Create Goal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add money to goal dialog */}
      <Dialog open={!!addMoneyGoal} onOpenChange={(v) => !v && setAddMoneyGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to "{addMoneyGoal?.title}"</DialogTitle>
            <DialogClose onClick={() => setAddMoneyGoal(null)} />
          </DialogHeader>
          <form onSubmit={handleAddMoney} className="space-y-4">
            <div>
              <Label htmlFor="add-amount">Amount (P)</Label>
              <Input
                id="add-amount"
                type="number"
                min="0"
                step="0.01"
                autoFocus
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Add Money
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
