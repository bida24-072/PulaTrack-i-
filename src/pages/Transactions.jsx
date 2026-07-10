import React, { useEffect, useMemo, useState } from "react";
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
import { Plus, Search, Download } from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TransactionForm from "@/components/TransactionForm";
import TransactionItem from "@/components/TransactionItem";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { exportTransactionsToCSV } from "@/lib/csvExport";
import { monthKeyOf } from "@/lib/utils";
import { Receipt } from "lucide-react";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // Build a "Month Year" filter list from the actual transaction dates
  const monthOptions = useMemo(() => {
    const set = new Set(transactions.map((t) => monthKeyOf(t.date)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.note || "").toLowerCase().includes(search.toLowerCase());
      const matchesMonth = monthFilter === "all" || monthKeyOf(t.date) === monthFilter;
      return matchesSearch && matchesMonth;
    });
  }, [transactions, search, monthFilter]);

  async function handleSubmit(data) {
    if (editing) {
      await updateDoc(doc(db, "users", user.uid, "transactions", editing.id), data);
    } else {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    }
    setEditing(null);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "users", user.uid, "transactions", id));
  }

  function openEdit(t) {
    setEditing(t);
    setFormOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </header>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search category or note..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="flex-1">
            <option value="all">All months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportTransactionsToCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try adjusting your search or filter, or add a new transaction."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionItem key={t.id} transaction={t} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}
