import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import type { TaskSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, RiskBadge } from "@/components/status-badges";
import { categoryLabel } from "@/lib/categories";
import { formatMoney, timeAgo } from "@/lib/format";

export function TaskRowCard({
  task,
  showRequester = false,
}: {
  task: TaskSummary;
  showRequester?: boolean;
}) {
  return (
    <Link
      to={`/app/tasks/${task.id}`}
      className="group block rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface transition-all hover:border-[#4263EB]/45 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            <RiskBadge risk={task.riskLevel} />
            <Badge tone="neutral">{categoryLabel(task.category)}</Badge>
            {task.fundedAt ? (
              <Badge tone="success" dot>
                Funded
              </Badge>
            ) : null}
          </div>

          <h3 className="font-display text-[15px] font-bold leading-snug text-[#141B2D] transition-colors group-hover:text-[#4263EB]">
            {task.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-5 text-[#68738A]">{task.question}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[11px] text-[#68738A]">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {timeAgo(task.createdAt)}
            </span>
            {showRequester && task.requester ? <span>Requester: {task.requester.name}</span> : null}
            {task.assignment?.reviewer ? (
              <span className="inline-flex items-center gap-1 text-[#0B7D56]">
                <CheckCircle2 className="size-3" /> Specialist: {task.assignment.reviewer.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E4E9F2] pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <div className="font-display text-lg font-bold tracking-tight text-[#141B2D] tabular-nums">
              {formatMoney(task.rewardMinor, task.currency)}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#68738A]">
              {task.currency} Escrow
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-md border border-[#E4E9F2] bg-[#F5F7FC] px-2.5 py-1 text-xs font-semibold text-[#141B2D] transition-colors group-hover:border-[#4263EB]/30 group-hover:bg-[#4263EB]/10 group-hover:text-[#2E4CCB]">
            Open <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export const TaskCard = TaskRowCard;
