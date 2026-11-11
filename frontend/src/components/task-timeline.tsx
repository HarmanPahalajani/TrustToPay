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
      icon: <Gavel className="size-3.5 text-[#9A6100]" />,
      ring: "border-[#F5A623]/40 bg-[#F5A623]/12",
    };
  }
  if (type.includes("PAYOUT")) {
    return {
      icon: <Wallet className="size-3.5 text-[#12A875]" />,
      ring: "border-[#12A875]/35 bg-[#12A875]/10",
    };
  }
  if (type.includes("FUNDING") || type.includes("ORDER")) {
    return {
      icon: <CreditCard className="size-3.5 text-[#4263EB]" />,
      ring: "border-[#4263EB]/30 bg-[#4263EB]/10",
    };
  }
  if (type.includes("VERIFICATION") || type.includes("RESUMED")) {
    return {
      icon: <CheckCircle2 className="size-3.5 text-[#12A875]" />,
      ring: "border-[#12A875]/35 bg-[#12A875]/10",
    };
  }
  if (type.includes("ASSIGN") || type.includes("CLAIM") || type.includes("OFFER")) {
    return {
      icon: <UserCheck className="size-3.5 text-[#7057F5]" />,
      ring: "border-[#7057F5]/30 bg-[#7057F5]/10",
    };
  }
  if (type.includes("RECONCILE")) {
    return {
      icon: <RefreshCw className="size-3.5 text-[#20BCE5]" />,
      ring: "border-[#20BCE5]/35 bg-[#20BCE5]/10",
    };
  }
  return {
    icon: <CircleDot className="size-3.5 text-[#68738A]" />,
    ring: "border-[#E4E9F2] bg-[#F5F7FC]",
  };
}

export function TaskTimeline({ events, dense = false }: { events: TaskEvent[]; dense?: boolean }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-[#68738A]">No activity updates recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-[#E4E9F2]">
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
            <div className="min-w-0 border-b border-[#E4E9F2] pb-3 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#141B2D]">{taskEventLabel(event.type)}</span>
                <span className="text-xs text-[#68738A] tabular-nums">{formatDate(event.createdAt)}</span>
              </div>
              <p className="mt-1 leading-5 text-[#4E596E]">{event.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
