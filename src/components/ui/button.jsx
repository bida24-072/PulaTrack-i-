import React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline: "border border-primary text-primary bg-transparent hover:bg-primary/5",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline bg-transparent",
};

const sizeClasses = {
  default: "h-11 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
export default Button;
