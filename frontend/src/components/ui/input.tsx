import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-1.5 text-sm text-[#202722] shadow-inset transition-colors placeholder:text-[#69736D]/75 focus-visible:border-[#365FEA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#365FEA] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-2 text-sm text-[#202722] shadow-inset transition-colors placeholder:text-[#69736D]/75 focus-visible:border-[#365FEA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#365FEA] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-1.5 text-sm text-[#202722] shadow-inset transition-colors focus-visible:border-[#365FEA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#365FEA] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-1 flex items-baseline justify-between gap-2", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-[#202722]">
        {children}
        {required && <span className="ml-1 text-[#CA2B2B]">*</span>}
      </label>
      {hint && <span className="text-[11px] text-[#69736D]">{hint}</span>}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-[#202722]">
          {label}
          {required && <span className="ml-1 text-[#CA2B2B]">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#69736D]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-[#CA2B2B]">{error}</p>}
    </div>
  );
}
