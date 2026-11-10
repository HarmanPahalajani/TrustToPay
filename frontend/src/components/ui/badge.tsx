import * as React from "react";
import { cn } from "../../lib/utils";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "cyan"
  | "accent"
  | "outline";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-[#F0EEE7] text-[#69736D] border-[#E5E1D7]",
  brand: "bg-[#365FEA]/10 text-[#2448B8] border-[#365FEA]/25",
  info: "bg-[#365FEA]/10 text-[#2448B8] border-[#365FEA]/25",
  cyan: "bg-[#438866]/10 text-[#2A6246] border-[#438866]/25",
  accent: "bg-[#365FEA]/10 text-[#2448B8] border-[#365FEA]/25",
  success: "bg-[#438866]/12 text-[#285E43] border-[#438866]/30",
  warning: "bg-[#B4690E]/12 text-[#8C500B] border-[#B4690E]/30",
  danger: "bg-[#CA2B2B]/10 text-[#A62626] border-[#CA2B2B]/25",
  outline: "bg-transparent text-[#69736D] border-[#E5E1D7]",
};

const DOT_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-[#69736D]",
  brand: "bg-[#365FEA]",
  info: "bg-[#365FEA]",
  cyan: "bg-[#438866]",
  accent: "bg-[#365FEA]",
  success: "bg-[#438866]",
  warning: "bg-[#B4690E]",
  danger: "bg-[#CA2B2B]",
  outline: "bg-[#69736D]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  mono?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  mono = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4 tracking-tight",
        mono && "font-mono",
        TONE_STYLES[tone] || TONE_STYLES.neutral,
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_STYLES[tone] || DOT_STYLES.neutral)} />}
      {children}
    </span>
  );
}
