import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "cobalt"
  | "indigo"
  | "cyan";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-[#E5E1D7] bg-[#F0EEE7] text-[#69736D]",
  info: "border-[#365FEA]/25 bg-[#365FEA]/10 text-[#2B4FC7]",
  cobalt: "border-[#365FEA]/25 bg-[#365FEA]/10 text-[#2B4FC7]",
  success: "border-[#438866]/30 bg-[#438866]/10 text-[#2F684C]",
  warning: "border-[#C97A2E]/35 bg-[#C97A2E]/12 text-[#8E5219]",
  danger: "border-[#E5484D]/30 bg-[#E5484D]/10 text-[#C1282D]",
  accent: "border-[#365FEA]/25 bg-[#365FEA]/10 text-[#2B4FC7]",
  indigo: "border-[#365FEA]/25 bg-[#365FEA]/10 text-[#2B4FC7]",
  cyan: "border-[#365FEA]/25 bg-[#365FEA]/10 text-[#2B4FC7]",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-[#69736D]",
  info: "bg-[#365FEA]",
  cobalt: "bg-[#365FEA]",
  success: "bg-[#438866]",
  warning: "bg-[#C97A2E]",
  danger: "bg-[#E5484D]",
  accent: "bg-[#365FEA]",
  indigo: "bg-[#365FEA]",
  cyan: "bg-[#365FEA]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("size-1.5 rounded-full shrink-0", DOT_CLASSES[tone])} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
