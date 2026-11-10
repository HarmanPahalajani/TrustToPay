import * as React from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_MAP: Record<AlertTone, { wrapper: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: {
    wrapper: "border-[#365FEA]/25 bg-[#365FEA]/[0.06] text-[#202722]",
    icon: Info,
  },
  success: {
    wrapper: "border-[#438866]/30 bg-[#438866]/[0.08] text-[#202722]",
    icon: CheckCircle2,
  },
  warning: {
    wrapper: "border-[#B4690E]/30 bg-[#B4690E]/[0.08] text-[#202722]",
    icon: AlertCircle,
  },
  danger: {
    wrapper: "border-[#CA2B2B]/30 bg-[#CA2B2B]/[0.06] text-[#202722]",
    icon: ShieldAlert,
  },
};

const ICON_COLOR: Record<AlertTone, string> = {
  info: "text-[#365FEA]",
  success: "text-[#438866]",
  warning: "text-[#B4690E]",
  danger: "text-[#CA2B2B]",
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
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-3.5 py-2.5 text-xs sm:flex-row sm:items-start sm:justify-between",
        wrapper,
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span className={cn("mt-0.5 shrink-0", ICON_COLOR[tone])} aria-hidden>
            {icon}
          </span>
        ) : (
          <DefaultIcon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_COLOR[tone])} />
        )}
        <div className="space-y-0.5">
          {title && <p className="font-heading text-xs font-bold leading-5 text-[#202722]">{title}</p>}
          {children && <div className="text-xs leading-relaxed text-[#202722]/85">{children}</div>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export const Alert = AlertBanner;
