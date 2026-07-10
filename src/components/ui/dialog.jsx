import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Lightweight modal dialog. Usage:
// <Dialog open={open} onOpenChange={setOpen}>
//   <DialogContent>
//     <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
//     ...body...
//   </DialogContent>
// </Dialog>
export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange?.(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10 w-full sm:max-w-md animate-fade-in">{children}</div>
    </div>
  );
}

export function DialogContent({ className, children, onClose }) {
  return (
    <div
      className={cn(
        "bg-white w-full sm:rounded-xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn("mb-4 flex items-center justify-between", className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)}>{children}</h2>;
}

export function DialogClose({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      aria-label="Close"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

export default Dialog;
