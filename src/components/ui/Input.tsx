"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-9 px-3 text-sm rounded",
            "bg-bg-deep border border-border-subtle text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-core-blue focus:ring-1 focus:ring-core-blue/30",
            "transition-colors duration-200",
            error && "border-danger-muted",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-muted">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
