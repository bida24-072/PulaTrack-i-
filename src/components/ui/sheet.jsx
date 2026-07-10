import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Slide-over panel from the right, similar to shadcn/ui's Sheet.
// Usage: <Sheet open={open} onOpenChange={setOpen}><SheetContent>...</SheetContent></Sheet>
export function Sheet({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl animate-fade-in">
        {children}
      </div>
    </div>
  );
}

export function SheetContent({ className, children }) {
  return <div className={cn("h-full overflow-y-auto p-5", className)}>{children}</div>;
}

export function SheetHeader({ children, onClose }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      {children}
      <button
        onClick={onClose}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export default Sheet;
