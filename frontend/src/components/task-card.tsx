import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, ShieldAlert, UserCheck, Users } from "lucide-react";
import type { TaskSummary } from "../lib/types";
import { formatCurrency, formatRelativeTime } from "../lib/utils";
import { Badge } from "./ui/badge";
import { TaskStatusBadge, UrgencyBadge } from "./status-badges";

export function TaskRowCard({
  task,
  href,
  showRequester = false,
}: {
  task: TaskSummary;
  href?: string;
  showRequester?: boolean;
}) {
  const target = href || `/app/tasks/${task.id}`;

  return (
    <Link
      to={target}
      className="group block rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3.5 sm:p-4 transition-all hover:border-[#365FEA]/40 hover:bg-[#F0EEE7]/50"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            <UrgencyBadge urgency={task.riskLevel} />
            <span className="font-mono text-[11px] text-[#69736D]">#{task.id.slice(0, 8)}</span>
            {showRequester && task.requester && (
              <span className="text-[11px] text-[#69736D]">by {task.requester.name}</span>
            )}
          </div>

          <h3 className="truncate font-heading text-sm font-bold text-[#202722] transition-colors group-hover:text-[#365FEA]">
            {task.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-[#69736D]">{task.question}</p>

          {task.requiredSkills && task.requiredSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {task.requiredSkills.slice(0, 5).map((skill: string) => (
                <Badge key={skill} tone="outline" mono>
                  {skill}
                </Badge>
              ))}
              {task.requiredSkills.length > 5 && (
                <span className="text-[11px] text-[#69736D]">+{task.requiredSkills.length - 5}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-[#E5E1D7] pt-2.5 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <div className="font-mono text-sm font-semibold text-[#202722] tabular-nums">
              {task.reward ? task.reward.amountDisplay : formatCurrency(task.rewardMinor, task.currency)}
            </div>
            <div className="text-[11px] text-[#69736D]">escrow budget</div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-[#69736D]">
            {task.assignment?.reviewer ? (
              <span className="inline-flex items-center gap-1 text-[#285E43]">
                <UserCheck className="h-3.5 w-3.5" />
                {task.assignment.reviewer.name}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(task.createdAt)}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#69736D] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#365FEA]" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export const TaskCard = TaskRowCard;
