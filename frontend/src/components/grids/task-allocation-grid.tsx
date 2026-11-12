import React, { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bot, Clock, ExternalLink, ShieldAlert, Sparkles, User } from "lucide-react";
import type { CommandTaskRow } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";
import { taskStatusLabel } from "@/lib/status-labels";
import { formatDate } from "@/lib/format";

interface TaskAllocationGridProps {
  tasks: CommandTaskRow[] | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectTask?: (task: CommandTaskRow | null) => void;
  height?: string | number;
}

export function TaskAllocationGrid({
  tasks,
  isLoading = false,
  error = null,
  onRetry,
  onSelectTask,
  height = "480px",
}: TaskAllocationGridProps) {
  const columnDefs = useMemo<ColDef<CommandTaskRow>[]>(
    () => [
      {
        field: "title",
        headerName: "Task & Question",
        minWidth: 260,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const row: CommandTaskRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722] truncate" title={row.title}>
                {row.title}
              </span>
              <span className="text-[11px] text-[#69736D] truncate" title={row.question}>
                {row.question}
              </span>
            </div>
          );
        },
      },
      {
        field: "aiAgent",
        headerName: "AI Agent",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          const row: CommandTaskRow = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-1.5 h-full">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#365FEA]/10 text-[#365FEA]">
                <Bot className="size-3" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs font-medium text-[#202722]">{row.aiAgent}</span>
                <span className="text-[10px] text-[#69736D] font-mono">{row.category}</span>
              </div>
            </div>
          );
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 110,
        cellRenderer: (params: any) => {
          const priority = params.value;
          const isHigh = priority === "HIGH";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold leading-none ${
                  isHigh
                    ? "bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30"
                    : "bg-[#F7F5EF] text-[#4B554F] border border-[#E5E1D7]"
                }`}
              >
                {isHigh ? <ShieldAlert className="size-3 text-[#E5484D]" /> : null}
                {priority}
              </span>
            </div>
          );
        },
      },
      {
        field: "requiredSkills",
        headerName: "Required Skills & Level",
        minWidth: 200,
        flex: 1.2,
        valueGetter: (params) => {
          const skills = params.data?.requiredSkills ?? [];
          return `${skills.join(", ")} (${params.data?.requiredProficiency})`;
        },
        cellRenderer: (params: any) => {
          const row: CommandTaskRow = params.data;
          if (!row) return null;
          const skills = row.requiredSkills ?? [];
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#F7F5EF] px-1.5 text-[10px] font-medium leading-none text-[#202722] border border-[#E5E1D7] truncate max-w-[120px]">
                {skills[0] || "General Technical"}
              </span>
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#365FEA]/10 px-1.5 text-[10px] font-semibold leading-none text-[#2B4FC7]">
                L{row.minimumSkillLevel} ({row.requiredProficiency})
              </span>
            </div>
          );
        },
      },
      {
        field: "estimatedReward",
        headerName: "Reward",
        width: 110,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center justify-center h-5 font-mono text-xs font-bold leading-none text-[#2B6146] bg-[#438866]/10 px-2 rounded-md border border-[#438866]/20">
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "Task Status",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isDone = ["COMPLETED", "PAYMENT_PAID"].includes(status);
          const isMatching = ["OFFERED", "FUNDED", "MATCHING"].includes(status);
          const isAssigned = ["ASSIGNED", "IN_PROGRESS", "SUBMITTED"].includes(status);
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center h-5 px-2.5 rounded-full text-[11px] font-medium leading-none border ${
                  isDone
                    ? "bg-[#438866]/15 text-[#2B6146] border-[#438866]/30"
                    : isMatching
                      ? "bg-[#365FEA]/15 text-[#2B4FC7] border-[#365FEA]/30"
                      : isAssigned
                        ? "bg-[#C97A2E]/15 text-[#C97A2E] border-[#C97A2E]/30"
                        : "bg-[#F7F5EF] text-[#69736D] border-[#E5E1D7]"
                }`}
              >
                {taskStatusLabel(status)}
              </span>
            </div>
          );
        },
      },
      {
        field: "assignedHuman",
        headerName: "Assigned Human",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          const name = params.value;
          const isAssigned = name && name !== "Unassigned";
          return (
            <div className="flex items-center gap-1.5 h-full">
              <User className={`size-3.5 ${isAssigned ? "text-[#438866]" : "text-[#8E9790]"}`} />
              <span className={`text-xs ${isAssigned ? "font-medium text-[#202722]" : "text-[#8E9790] italic"}`}>
                {name || "Unassigned"}
              </span>
            </div>
          );
        },
      },
      {
        field: "deadline",
        headerName: "Deadline",
        width: 100,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center gap-1 h-full text-xs text-[#69736D]">
              <Clock className="size-3" />
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: "Action",
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const row: CommandTaskRow = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center h-full">
              <Link
                to={`/app/tasks/${row.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#365FEA] hover:underline"
              >
                View <ArrowUpRight className="size-3" />
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataGrid<CommandTaskRow>
      rowData={tasks}
      columnDefs={columnDefs}
      title="Active AI Tasks & Allocation Registry"
      subtitle="Complete ledger of incoming AI tasks, matching pipeline statuses, and specialist assignments"
      height={height}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowSelect={onSelectTask}
      exportFileName="trusttopay-tasks-allocation.csv"
    />
  );
}
