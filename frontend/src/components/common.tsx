import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState, LoadingBlock } from "@/components/ui/states";
import { AlertBanner, Alert } from "@/components/ui/alert";

export { Card, EmptyState, ErrorState, LoadingState, LoadingBlock, AlertBanner, Alert };

export function PageHeader({
  eyebrow: _eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#E5E1D7] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-[#69736D]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="inline-flex items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3.5 text-[#9AA29C]" /> : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="font-medium transition-colors hover:text-[#365FEA]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#202722]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#202722] sm:text-[30px] sm:leading-[1.18]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[15px] leading-6 text-[#69736D]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow: _eyebrow,
  title,
  description,
  action,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight text-[#202722] sm:text-xl">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[#69736D]">{description}</p> : null}
      </div>
      {actions ?? action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const iconTone: Record<NonNullable<typeof tone>, string> = {
    neutral: "bg-[#F0EEE7] text-[#69736D]",
    info: "bg-[#365FEA]/10 text-[#365FEA]",
    success: "bg-[#438866]/10 text-[#438866]",
    warning: "bg-[#C97A2E]/12 text-[#8E5219]",
    danger: "bg-[#E5484D]/10 text-[#E5484D]",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#69736D]">{label}</p>
          <p className="mt-2 font-sans text-[28px] font-bold leading-none tracking-tight text-[#202722] tabular-nums sm:text-[32px]">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs leading-5 text-[#69736D]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", iconTone[tone])}>
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  to?: string;
}) {
  const iconColor: Record<NonNullable<typeof tone>, string> = {
    neutral: "text-[#69736D] bg-[#F0EEE7]",
    info: "text-[#365FEA] bg-[#365FEA]/10",
    success: "text-[#438866] bg-[#438866]/10",
    warning: "text-[#8E5219] bg-[#C97A2E]/15",
    danger: "text-[#E5484D] bg-[#E5484D]/10",
  };

  const inner = (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-5 shadow-surface transition-colors",
        to && "hover:border-[#365FEA]/45 hover:bg-[#F7F5EF]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[#69736D]">{label}</span>
        {icon ? <span className={cn("rounded-lg p-2", iconColor[tone])}>{icon}</span> : null}
      </div>
      <div className="mt-3 font-sans text-[30px] font-bold leading-none tracking-tight text-[#202722] tabular-nums">
        {value}
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-[#69736D]">{hint}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365FEA]">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function DataRow({
  label,
  children,
  mono = false,
  className,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[#E5E1D7] py-3 text-[13px] last:border-b-0",
        className,
      )}
    >
      <dt className="shrink-0 font-medium text-[#69736D]">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-right font-semibold text-[#202722] tabular-nums",
          mono && "font-mono text-xs font-medium",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function DataField({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="text-xs font-medium text-[#69736D]">{label}</div>
      <div className={cn("text-sm font-medium text-[#202722] tabular-nums", mono && "font-mono text-xs")}>
        {value}
      </div>
    </div>
  );
}
