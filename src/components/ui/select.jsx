import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// A lightweight, dependency-free Select styled like shadcn/ui.
// Usage: <Select value={v} onChange={(e) => setV(e.target.value)}>
//          <option value="Food">Food</option>
//        </Select>
const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
});
Select.displayName = "Select";

export { Select };
export default Select;
