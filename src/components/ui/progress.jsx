import React from "react";
import { cn } from "@/lib/utils";

// value: 0-100. `colorClassName` lets callers override the fill color
// (e.g. amber when a budget is near its limit, red when over).
export function Progress({ value = 0, className, colorClassName = "bg-primary" }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default Progress;
