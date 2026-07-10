import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loader({ fullScreen = false, label = "Loading..." }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-slate-500",
        fullScreen ? "h-screen w-full" : "py-12"
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
