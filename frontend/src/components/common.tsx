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
    <div className="flex flex-col gap-4 border-b border-[#E4E9F2] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-[#68738A]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="inline-flex items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3.5 text-[#94A3B8]" /> : null}
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-[30px] sm:leading-[1.18]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[15px] leading-6 text-[#4E596E]">{description}</p>
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
        <h2 className="font-display text-lg font-bold tracking-tight text-[#141B2D] sm:text-xl">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[#68738A]">{description}</p> : null}
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
    neutral: "bg-[#EDF0F6] text-[#4E596E]",
    info: "bg-[#4263EB]/10 text-[#4263EB]",
    success: "bg-[#12A875]/10 text-[#12A875]",
    warning: "bg-[#F5A623]/12 text-[#9A6100]",
    danger: "bg-[#E5484D]/10 text-[#E5484D]",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#68738A]">{label}</p>
          <p className="mt-2 font-sans text-[28px] font-bold leading-none tracking-tight text-[#141B2D] tabular-nums sm:text-[32px]">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs leading-5 text-[#68738A]">{hint}</p> : null}
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
    neutral: "text-[#4E596E] bg-[#EDF0F6]",
    info: "text-[#4263EB] bg-[#4263EB]/10",
    success: "text-[#12A875] bg-[#12A875]/10",
    warning: "text-[#9A6100] bg-[#F5A623]/15",
    danger: "text-[#E5484D] bg-[#E5484D]/10",
  };

  const inner = (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-5 shadow-surface transition-colors",
        to && "hover:border-[#4263EB]/45 hover:bg-[#FAFBFD]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[#68738A]">{label}</span>
        {icon ? <span className={cn("rounded-lg p-2", iconColor[tone])}>{icon}</span> : null}
      </div>
      <div className="mt-3 font-sans text-[30px] font-bold leading-none tracking-tight text-[#141B2D] tabular-nums">
        {value}
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-[#68738A]">{hint}</p> : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]">
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
        "flex items-center justify-between gap-4 border-b border-[#E4E9F2] py-3 text-[13px] last:border-b-0",
        className,
      )}
    >
      <dt className="shrink-0 font-medium text-[#68738A]">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-right font-semibold text-[#141B2D] tabular-nums",
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
      <div className="text-xs font-medium text-[#68738A]">{label}</div>
      <div className={cn("text-sm font-medium text-[#141B2D] tabular-nums", mono && "font-mono text-xs")}>
        {value}
      </div>
    </div>
  );
}
