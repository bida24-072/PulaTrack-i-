import React, { useState } from "react";
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatPula, formatDate } from "@/lib/utils";

export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isIncome = transaction.type === "Income";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
          }`}
        >
          {isIncome ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{transaction.category}</p>
          <p className="truncate text-xs text-slate-400">
            {formatDate(transaction.date)}
            {transaction.note ? ` · ${transaction.note}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`font-tabular font-semibold ${isIncome ? "text-income" : "text-expense"}`}
        >
          {isIncome ? "+" : "-"}
          {formatPula(transaction.amount)}
        </span>

        {!confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(transaction)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => onDelete(transaction.id)}
              className="rounded-md bg-destructive px-2 py-1 text-white"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-md bg-slate-100 px-2 py-1 text-slate-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
