import * as React from "react";
import { cn } from "../lib/utils";
import { Card } from "./ui/card";
import { EmptyState, ErrorState, LoadingState, LoadingBlock } from "./ui/states";
import { AlertBanner, Alert } from "./ui/alert";

export { Card, EmptyState, ErrorState, LoadingState, LoadingBlock, AlertBanner, Alert };

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  breadcrumbs,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 border-b border-[#E5E1D7] pb-3.5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#69736D]">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span>/</span>}
                {crumb.to ? (
                  <a href={crumb.to} className="hover:text-[#202722]">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[#202722]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {eyebrow && (
          <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#365FEA]">{eyebrow}</div>
        )}
        <h1 className="font-heading text-xl font-bold tracking-tight text-[#202722] sm:text-2xl">{title}</h1>
        {description && <div className="max-w-2xl text-xs leading-relaxed text-[#69736D] sm:text-sm">{description}</div>}
        {meta && <div className="flex flex-wrap items-center gap-2 pt-0.5">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-2.5 flex flex-wrap items-end justify-between gap-2", className)}>
      <div>
        <h2 className="font-heading text-sm font-bold tracking-tight text-[#202722] sm:text-base">{title}</h2>
        {description && <div className="mt-0.5 text-xs text-[#69736D]">{description}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
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
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const toneStyles = {
    neutral: "text-[#69736D] bg-[#F0EEE7] border-[#E5E1D7]",
    info: "text-[#365FEA] bg-[#365FEA]/10 border-[#365FEA]/25",
    success: "text-[#438866] bg-[#438866]/10 border-[#438866]/25",
    warning: "text-[#B4690E] bg-[#B4690E]/10 border-[#B4690E]/25",
    danger: "text-[#CA2B2B] bg-[#CA2B2B]/10 border-[#CA2B2B]/25",
  };

  return (
    <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3.5 sm:p-4 shadow-surface">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736D]">{label}</span>
        {icon && (
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-md border", toneStyles[tone])}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-1.5 font-heading text-xl font-bold tracking-tight text-[#202722] tabular-nums sm:text-2xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-[#69736D]">{hint}</div>}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
  mono = true,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "brand" | "success" | "warning" | "danger";
  mono?: boolean;
}) {
  const accentMap = {
    default: "text-[#69736D] bg-[#F0EEE7] border-[#E5E1D7]",
    brand: "text-[#365FEA] bg-[#365FEA]/10 border-[#365FEA]/25",
    success: "text-[#438866] bg-[#438866]/10 border-[#438866]/25",
    warning: "text-[#B4690E] bg-[#B4690E]/10 border-[#B4690E]/25",
    danger: "text-[#CA2B2B] bg-[#CA2B2B]/10 border-[#CA2B2B]/25",
  };

  return (
    <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3.5 sm:p-4 shadow-surface">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736D]">{label}</span>
        {Icon && (
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-md border", accentMap[tone])}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-1.5 text-xl font-bold tracking-tight text-[#202722] sm:text-2xl tabular-nums",
          mono ? "font-mono" : "font-heading",
        )}
      >
        {value}
      </div>
      {sublabel && <div className="mt-1 text-[11px] text-[#69736D]">{sublabel}</div>}
    </div>
  );
}

export function DataRow({
  label,
  children,
  className,
  mono,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E5E1D7]/70 py-1.5 text-xs last:border-b-0",
        className,
      )}
    >
      <dt className="font-medium text-[#69736D]">{label}</dt>
      <dd className={cn("text-right font-medium text-[#202722]", mono && "font-mono text-xs")}>{children}</dd>
    </div>
  );
}

export function DataField({
  label,
  value,
  mono = false,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-[#69736D]">{label}</dt>
      <dd className={cn("text-xs sm:text-sm text-[#202722]", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
