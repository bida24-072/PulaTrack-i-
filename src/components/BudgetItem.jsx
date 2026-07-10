import React from "react";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatPula } from "@/lib/utils";

export default function BudgetItem({ budget, spent, onEdit, onDelete }) {
  const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const isOver = percent >= 100;
  const isNearLimit = percent >= 80 && percent < 100;

  const colorClassName = isOver ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary";

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800">{budget.category}</p>
          <p className="text-xs text-slate-400">
            {formatPula(spent)} of {formatPula(budget.amount)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isOver || isNearLimit) && (
            <AlertTriangle
              className={`h-4 w-4 ${isOver ? "text-destructive" : "text-amber-500"}`}
            />
          )}
          <button onClick={() => onEdit(budget)} className="p-1 text-slate-400 hover:text-primary">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1 text-slate-400 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Progress value={percent} colorClassName={colorClassName} />
      {isOver && (
        <p className="mt-1 text-xs font-medium text-destructive">Budget exceeded!</p>
      )}
      {isNearLimit && (
        <p className="mt-1 text-xs font-medium text-amber-600">
          You've used {Math.round(percent)}% of this budget.
        </p>
      )}
    </div>
  );
}
