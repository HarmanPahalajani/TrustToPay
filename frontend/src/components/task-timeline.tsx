import {
  CheckCircle2,
  CircleDot,
  CreditCard,
  Gavel,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Wallet,
} from "lucide-react";
import type { TaskEvent } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { taskEventLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

function eventStyle(type: string): { icon: React.ReactNode; ring: string } {
  if (type.includes("FAILED") || type.includes("REJECTED") || type.includes("CANCEL")) {
    return {
      icon: <ShieldAlert className="size-3.5 text-[#E5484D]" />,
      ring: "border-[#E5484D]/35 bg-[#E5484D]/10",
    };
  }
  if (type.includes("DISPUTE")) {
    return {
      icon: <Gavel className="size-3.5 text-[#8E5219]" />,
      ring: "border-[#C97A2E]/40 bg-[#C97A2E]/12",
    };
  }
  if (type.includes("PAYOUT")) {
    return {
      icon: <Wallet className="size-3.5 text-[#438866]" />,
      ring: "border-[#438866]/35 bg-[#438866]/10",
    };
  }
  if (type.includes("FUNDING") || type.includes("ORDER")) {
    return {
      icon: <CreditCard className="size-3.5 text-[#365FEA]" />,
      ring: "border-[#365FEA]/30 bg-[#365FEA]/10",
    };
  }
  if (type.includes("VERIFICATION") || type.includes("RESUMED")) {
    return {
      icon: <CheckCircle2 className="size-3.5 text-[#438866]" />,
      ring: "border-[#438866]/35 bg-[#438866]/10",
    };
  }
  if (type.includes("ASSIGN") || type.includes("CLAIM") || type.includes("OFFER")) {
    return {
      icon: <UserCheck className="size-3.5 text-[#365FEA]" />,
      ring: "border-[#365FEA]/30 bg-[#365FEA]/10",
    };
  }
  if (type.includes("RECONCILE")) {
    return {
      icon: <RefreshCw className="size-3.5 text-[#365FEA]" />,
      ring: "border-[#365FEA]/35 bg-[#365FEA]/10",
    };
  }
  return {
    icon: <CircleDot className="size-3.5 text-[#69736D]" />,
    ring: "border-[#E5E1D7] bg-[#F7F5EF]",
  };
}

export function TaskTimeline({ events, dense = false }: { events: TaskEvent[]; dense?: boolean }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-[#69736D]">No activity updates recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-[#E5E1D7]">
      {events.map((event) => {
        const style = eventStyle(event.type);
        return (
          <li key={event.id} className={cn("relative pl-10", dense ? "text-xs" : "text-[13px]")}>
            <span
              className={cn(
                "absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border",
                style.ring,
              )}
              aria-hidden="true"
            >
              {style.icon}
            </span>
            <div className="min-w-0 border-b border-[#E5E1D7] pb-3 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#202722]">{taskEventLabel(event.type)}</span>
                <span className="text-xs text-[#69736D] tabular-nums">{formatDate(event.createdAt)}</span>
              </div>
              <p className="mt-1 leading-5 text-[#69736D]">{event.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
