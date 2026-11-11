import * as React from "react";
import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-[#E5E1D7]", className)} {...props} />;
}

export function LoadingState({
  label = "Loading…",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-5 shadow-surface", className)}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#69736D]">
        <Loader2 className="size-4 animate-spin text-[#365FEA]" />
        <span>{label}</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={index === 0 ? "h-10 w-full" : "h-7 w-5/6"} />
        ))}
      </div>
    </div>
  );
}

export const LoadingBlock = LoadingState;

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D4CFC3] bg-[#FFFEFA] px-6 py-12 text-center shadow-surface",
        className,
      )}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] text-[#365FEA]">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="font-display text-sm font-bold text-[#202722]">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-xs leading-5 text-[#69736D]">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load this page",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-[#E5484D]/30 bg-[#FFFEFA] p-5 shadow-surface sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E5484D]/10 text-[#E5484D]">
          <AlertCircle className="size-4" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-[#202722]">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[#69736D]">
            {message ?? "We couldn't load this right now. Please try again."}
          </p>
        </div>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      ) : null}
    </div>
  );
}
