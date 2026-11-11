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
      className="group block rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-5 shadow-surface transition-colors hover:border-[#4263EB]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            <RiskBadge risk={task.riskLevel} />
            <Badge tone="neutral">{categoryLabel(task.category)}</Badge>
            {task.fundedAt ? (
              <Badge tone="success" dot>
                Payment ready
              </Badge>
            ) : null}
          </div>

          <h3 className="font-display text-base font-semibold leading-snug text-[#141B2D] transition-colors group-hover:text-[#4263EB]">
            {task.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-6 text-[#4E596E]">{task.question}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5 text-xs text-[#68738A]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {timeAgo(task.createdAt)}
            </span>
            {showRequester && task.requester ? <span>Requested by {task.requester.name}</span> : null}
            {task.assignment?.reviewer ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#0B7D56]">
                <CheckCircle2 className="size-3.5" /> Specialist: {task.assignment.reviewer.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E4E9F2] pt-3.5 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <div className="font-sans text-2xl font-bold leading-none tracking-tight text-[#141B2D] tabular-nums">
              {formatMoney(task.rewardMinor, task.currency)}
            </div>
            <div className="mt-1 text-xs font-medium text-[#68738A]">Task reward ({task.currency})</div>
          </div>

          <span className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#E4E9F2] bg-[#F5F7FC] px-3 py-1.5 text-xs font-semibold text-[#141B2D] transition-colors group-hover:border-[#4263EB]/30 group-hover:bg-[#4263EB]/10 group-hover:text-[#2E4CCB]">
            View task <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export const TaskCard = TaskRowCard;
