import * as React from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-[#E9E6DD]", className)} {...props} />;
}

export function LoadingState({
  label = "Loading data...",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-4", className)} role="status">
      <div className="flex items-center gap-2 text-xs text-[#69736D]">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#365FEA]" />
        <span>{label}</span>
      </div>
      <div className="space-y-2 pt-1">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

export const LoadingBlock = LoadingState;

export function EmptyState({
  icon: IconOrElement = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const isElement = React.isValidElement(IconOrElement);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[#D2CDC0] bg-[#FFFEFA] px-5 py-6 text-center",
        className,
      )}
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E1D7] bg-[#F0EEE7] text-[#69736D]">
        {isElement ? (
          IconOrElement
        ) : (
          (() => {
            const Comp = IconOrElement as React.ComponentType<{ className?: string }>;
            return <Comp className="h-4 w-4" />;
          })()
        )}
      </div>
      <h3 className="font-heading text-sm font-bold text-[#202722]">{title}</h3>
      {description && <p className="mt-1 max-w-md text-xs leading-relaxed text-[#69736D]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load resource",
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
        "flex flex-col items-start justify-between gap-3 rounded-lg border border-[#CA2B2B]/30 bg-[#CA2B2B]/[0.05] p-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#CA2B2B]" />
        <div>
          <p className="font-heading text-sm font-bold text-[#202722]">{title}</p>
          {message && <p className="mt-0.5 text-xs text-[#69736D]">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
