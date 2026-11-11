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
  neutral: "border-[#E4E9F2] bg-[#EDF0F6] text-[#4E596E]",
  info: "border-[#4263EB]/25 bg-[#4263EB]/10 text-[#2E4CCB]",
  cobalt: "border-[#4263EB]/25 bg-[#4263EB]/10 text-[#2E4CCB]",
  success: "border-[#12A875]/30 bg-[#12A875]/10 text-[#0B7D56]",
  warning: "border-[#F5A623]/35 bg-[#F5A623]/12 text-[#9A6100]",
  danger: "border-[#E5484D]/30 bg-[#E5484D]/10 text-[#C1282D]",
  accent: "border-[#7057F5]/25 bg-[#7057F5]/10 text-[#553DD6]",
  indigo: "border-[#7057F5]/25 bg-[#7057F5]/10 text-[#553DD6]",
  cyan: "border-[#20BCE5]/35 bg-[#20BCE5]/10 text-[#0B728E]",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-[#68738A]",
  info: "bg-[#4263EB]",
  cobalt: "bg-[#4263EB]",
  success: "bg-[#12A875]",
  warning: "bg-[#F5A623]",
  danger: "bg-[#E5484D]",
  accent: "bg-[#7057F5]",
  indigo: "bg-[#7057F5]",
  cyan: "bg-[#20BCE5]",
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
