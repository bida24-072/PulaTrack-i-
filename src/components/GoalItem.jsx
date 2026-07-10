import React from "react";
import * as Icons from "lucide-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatPula, formatDate } from "@/lib/utils";

export default function GoalItem({ goal, onEdit, onDelete, onAddMoney }) {
  const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isComplete = percent >= 100;
  const Icon = Icons[goal.icon] || Icons.Target;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{goal.title}</p>
            {goal.deadline && (
              <p className="text-xs text-slate-400">Target: {formatDate(goal.deadline)}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(goal)} className="p-1 text-slate-400 hover:text-primary">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1 text-slate-400 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Progress value={percent} colorClassName={isComplete ? "bg-income" : "bg-accent"} />

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-tabular font-semibold text-slate-800">
          {formatPula(goal.currentAmount)}{" "}
          <span className="font-normal text-slate-400">/ {formatPula(goal.targetAmount)}</span>
        </span>
        {isComplete ? (
          <span className="text-xs font-semibold text-income">Goal reached! 🎉</span>
        ) : (
          <button
            onClick={() => onAddMoney(goal)}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <Plus className="h-3 w-3" /> Add money
          </button>
        )}
      </div>
    </div>
  );
}
