import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { formatPula, currentMonthKey, monthKeyOf, CATEGORY_COLORS } from "@/lib/utils";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const monthKey = currentMonthKey();

  const { totalIncome, totalExpenses, totalBalance, categoryTotals } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let allIncome = 0;
    let allExpenses = 0;
    const catTotals = {};

    transactions.forEach((t) => {
      const isThisMonth = monthKeyOf(t.date) === monthKey;
      if (t.type === "Income") {
        allIncome += t.amount;
        if (isThisMonth) income += t.amount;
      } else {
        allExpenses += t.amount;
        if (isThisMonth) {
          expenses += t.amount;
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: allIncome - allExpenses,
      categoryTotals: Object.entries(catTotals).map(([name, value]) => ({ name, value })),
    };
  }, [transactions, monthKey]);

  // Build last 6 months of income vs expense totals for the bar chart
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKeyOf(d);
      const label = d.toLocaleDateString("en-GB", { month: "short" });
      months.push({ key, label, Income: 0, Expenses: 0 });
    }
    transactions.forEach((t) => {
      const key = monthKeyOf(t.date);
      const entry = months.find((m) => m.key === key);
      if (entry) {
        if (t.type === "Income") entry.Income += t.amount;
        else entry.Expenses += t.amount;
      }
    });
    return months;
  }, [transactions]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 animate-fade-in">
      <header className="mb-5">
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h1 className="text-xl font-bold text-slate-900">{profile?.name?.split(" ")[0] || "there"} 👋</h1>
      </header>

      {/* Summary cards */}
      <Card className="mb-4 bg-primary text-white border-none">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-white/70">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Total Balance</span>
          </div>
          <p className="mt-1 font-tabular text-3xl font-bold">{formatPula(totalBalance)}</p>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 text-income">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Income (month)</span>
            </div>
            <p className="mt-1 font-tabular text-lg font-bold text-slate-800">
              {formatPula(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 text-expense">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Expenses (month)</span>
            </div>
            <p className="mt-1 font-tabular text-lg font-bold text-slate-800">
              {formatPula(totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart: Income vs Expenses, last 6 months */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Income vs Expenses (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ left: -20, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatPula(v)} />
              <Bar dataKey="Income" fill="#1E8E5A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#C0392B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie chart: expense categories this month */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Expenses by Category (this month)</h2>
          {categoryTotals.length === 0 ? (
            <EmptyState title="No expenses yet" description="Add a transaction to see the breakdown." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryTotals.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#7F8C8D"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatPula(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
