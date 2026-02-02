import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          
          // Variants
          variant === "primary" && "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
          variant === "secondary" && "bg-white/10 text-white hover:bg-white/20 border border-white/10",
          variant === "outline" && "border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
          variant === "ghost" && "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary",
          variant === "glow" && "bg-primary text-white shadow-glow hover:scale-105",

          // Sizes
          size === "sm" && "h-9 px-3 text-xs",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-14 px-8 text-lg",
          size === "icon" && "h-10 w-10 p-0",

          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };