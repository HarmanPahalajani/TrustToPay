import * as React from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_MAP: Record<AlertTone, { wrapper: string; icon: React.ReactNode }> = {
  info: {
    wrapper: "border-[#4263EB]/25 bg-[#4263EB]/[0.06] text-[#141B2D]",
    icon: <Info className="size-4 shrink-0 text-[#4263EB]" />,
  },
  success: {
    wrapper: "border-[#12A875]/30 bg-[#12A875]/[0.07] text-[#141B2D]",
    icon: <CheckCircle2 className="size-4 shrink-0 text-[#12A875]" />,
  },
  warning: {
    wrapper: "border-[#F5A623]/40 bg-[#F5A623]/[0.09] text-[#141B2D]",
    icon: <AlertCircle className="size-4 shrink-0 text-[#D48806]" />,
  },
  danger: {
    wrapper: "border-[#E5484D]/35 bg-[#E5484D]/[0.07] text-[#141B2D]",
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
        {title ? <p className="font-semibold text-[#141B2D]">{title}</p> : null}
        <div className="text-[#4E596E]">{children}</div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export const Alert = AlertBanner;
