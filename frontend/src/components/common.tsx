import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState, LoadingBlock } from "@/components/ui/states";
import { AlertBanner, Alert } from "@/components/ui/alert";

export { Card, EmptyState, ErrorState, LoadingState, LoadingBlock, AlertBanner, Alert };

export function PageHeader({
  eyebrow,
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
    <div className="flex flex-col gap-4 border-b border-[#E4E9F2] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-[#68738A]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="inline-flex items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3 text-[#94A3B8]" /> : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="font-medium transition-colors hover:text-[#4263EB]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#141B2D]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-[28px] sm:leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-[#68738A]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
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
    <div className={cn("flex flex-wrap items-end justify-between gap-2", className)}>
      <div className="min-w-0 space-y-0.5">
        {eyebrow ? (
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-base font-bold tracking-tight text-[#141B2D]">{title}</h2>
        {description ? <p className="text-xs leading-5 text-[#68738A]">{description}</p> : null}
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
    neutral: "border-[#E4E9F2] bg-[#F5F7FC] text-[#4E596E]",
    info: "border-[#4263EB]/20 bg-[#4263EB]/10 text-[#4263EB]",
    success: "border-[#12A875]/20 bg-[#12A875]/10 text-[#12A875]",
    warning: "border-[#F5A623]/30 bg-[#F5A623]/12 text-[#9A6100]",
    danger: "border-[#E5484D]/25 bg-[#E5484D]/10 text-[#E5484D]",
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#68738A]">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#141B2D] tabular-nums">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs leading-4 text-[#68738A]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border", iconTone[tone])}>
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
    neutral: "text-[#4E596E] bg-[#EDF0F6]",
    info: "text-[#4263EB] bg-[#4263EB]/10",
    success: "text-[#12A875] bg-[#12A875]/10",
    warning: "text-[#9A6100] bg-[#F5A623]/15",
    danger: "text-[#E5484D] bg-[#E5484D]/10",
  };

  const inner = (
    <div
      className={cn(
        "rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface transition-colors",
        to && "hover:border-[#4263EB]/40 hover:bg-[#F5F7FC]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#68738A]">{label}</span>
        {icon ? <span className={cn("rounded-md p-1.5", iconColor[tone])}>{icon}</span> : null}
      </div>
      <div className="mt-2 font-display text-2xl font-bold tracking-tight text-[#141B2D] tabular-nums">{value}</div>
      {hint ? <p className="mt-1 truncate text-xs text-[#68738A]">{hint}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]">
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
        "flex items-center justify-between gap-4 border-b border-[#E4E9F2] py-2.5 text-xs last:border-b-0",
        className,
      )}
    >
      <dt className="shrink-0 font-medium text-[#68738A]">{label}</dt>
      <dd className={cn("min-w-0 break-all text-right font-semibold text-[#141B2D]", mono && "font-mono text-[11px]")}>
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
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#68738A]">{label}</div>
      <div className={cn("text-xs font-medium text-[#141B2D]", mono && "font-mono text-[11px]")}>{value}</div>
    </div>
  );
}
