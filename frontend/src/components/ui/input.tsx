import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] px-3 py-2 text-base text-[#141B2D] placeholder:text-[#68738A] shadow-surface transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:border-[#4263EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]/20 disabled:cursor-not-allowed disabled:bg-[#EDF0F6] disabled:opacity-60 sm:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] px-3 py-2.5 text-base leading-6 text-[#141B2D] placeholder:text-[#68738A] shadow-surface transition-colors focus-visible:border-[#4263EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]/20 disabled:cursor-not-allowed disabled:bg-[#EDF0F6] disabled:opacity-60 sm:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] px-3 py-2 text-base text-[#141B2D] shadow-surface transition-colors focus-visible:border-[#4263EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]/20 disabled:cursor-not-allowed disabled:bg-[#EDF0F6] disabled:opacity-60 sm:text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function FieldLabel({
  children,
  htmlFor,
  hint,
  required,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-2", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-[#141B2D]">
        {children}
        {required ? <span className="ml-0.5 text-[#E5484D]">*</span> : null}
      </label>
      {hint ? <span className="text-[11px] text-[#68738A]">{hint}</span> : null}
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
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      {children}
      {error ? (
        <p className="text-xs font-medium text-[#E5484D]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-4 text-[#68738A]">{hint}</p>
      ) : null}
    </div>
  );
}
