import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function Avatar({ src, name = "", size = 40, className }) {
  const [errored, setErrored] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        onError={() => setErrored(true)}
        style={{ width: size, height: size }}
        className={cn("rounded-full object-cover border border-slate-200", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-accent font-semibold",
        className
      )}
    >
      {initials || "U"}
    </div>
  );
}

export default Avatar;
