import * as React from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_MAP: Record<AlertTone, { wrapper: string; icon: React.ReactNode }> = {
  info: {
    wrapper: "border-[#365FEA]/25 bg-[#365FEA]/[0.06] text-[#202722]",
    icon: <Info className="size-4 shrink-0 text-[#365FEA]" />,
  },
  success: {
    wrapper: "border-[#438866]/30 bg-[#438866]/[0.08] text-[#202722]",
    icon: <CheckCircle2 className="size-4 shrink-0 text-[#438866]" />,
  },
  warning: {
    wrapper: "border-[#C97A2E]/35 bg-[#C97A2E]/[0.08] text-[#202722]",
    icon: <AlertCircle className="size-4 shrink-0 text-[#C97A2E]" />,
  },
  danger: {
    wrapper: "border-[#E5484D]/35 bg-[#E5484D]/[0.07] text-[#202722]",
    icon: <ShieldAlert className="size-4 shrink-0 text-[#E5484D]" />,
  },
};

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AlertBanner({
  tone = "info",
  title,
  icon,
  actions,
  children,
  className,
  ...props
}: AlertBannerProps) {
  const { wrapper, icon: DefaultIcon } = TONE_MAP[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-5", wrapper, className)}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? DefaultIcon}</span>
      <div className="min-w-0 flex-1 space-y-0.5">
        {title ? <p className="font-semibold text-[#202722]">{title}</p> : null}
        <div className="text-[#69736D]">{children}</div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export const Alert = AlertBanner;
