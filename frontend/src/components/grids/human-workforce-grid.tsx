import React, { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { Award, CheckCircle2, Clock, ShieldCheck, UserCheck } from "lucide-react";
import type { CommandWorkforceRow } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";

interface HumanWorkforceGridProps {
  workforce: CommandWorkforceRow[] | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectSpecialist?: (specialist: CommandWorkforceRow | null) => void;
  height?: string | number;
}

export function HumanWorkforceGrid({
  workforce,
  isLoading = false,
  error = null,
  onRetry,
  onSelectSpecialist,
  height = "480px",
}: HumanWorkforceGridProps) {
  const columnDefs = useMemo<ColDef<CommandWorkforceRow>[]>(
    () => [
      {
        field: "name",
        headerName: "Specialist Name & Email",
        minWidth: 200,
        flex: 1.3,
        cellRenderer: (params: any) => {
          const row: CommandWorkforceRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722]">{row.name}</span>
              <span className="text-[11px] text-[#69736D] truncate">{row.email}</span>
            </div>
          );
        },
      },
      {
        field: "profileStatus",
        headerName: "Status",
        width: 120,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isApproved = status === "Approved" || status === "Active";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isApproved
                    ? "bg-[#438866]/15 text-[#2B6146] border-[#438866]/30"
                    : "bg-[#C97A2E]/15 text-[#C97A2E] border-[#C97A2E]/30"
                }`}
              >
                {isApproved ? <CheckCircle2 className="size-3 text-[#2B6146]" /> : null}
                {status}
              </span>
            </div>
          );
        },
      },
      {
        field: "highestLevelName",
        headerName: "Highest Certified Level",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          const row: CommandWorkforceRow = params.data;
          if (!row) return null;
          const lvl = row.highestVerifiedLevel;
          return (
            <div className="flex items-center gap-1.5 h-full">
              <Award className="size-3.5 text-[#365FEA]" />
              <span className="text-xs font-semibold text-[#202722]">
                Level {lvl} ({row.highestLevelName})
              </span>
            </div>
          );
        },
      },
      {
        field: "verifiedSkills",
        headerName: "Verified Skills",
        minWidth: 220,
        flex: 1.5,
        valueGetter: (params) => (params.data?.verifiedSkills ?? []).join(", "),
        cellRenderer: (params: any) => {
          const skills: string[] = params.data?.verifiedSkills ?? [];
          return (
            <div className="flex items-center gap-1 h-full flex-wrap py-1">
              {skills.slice(0, 2).map((s, idx) => (
                <span
                  key={idx}
                  className="rounded bg-[#F7F5EF] px-1.5 py-0.5 text-[10px] font-medium text-[#202722] border border-[#E5E1D7]"
                >
                  {s}
                </span>
              ))}
              {skills.length > 2 ? (
                <span className="text-[10px] text-[#69736D]">+{skills.length - 2} more</span>
              ) : null}
            </div>
          );
        },
      },
      {
        field: "successRate",
        headerName: "Success Rate",
        width: 130,
        cellRenderer: (params: any) => {
          const rate = params.value ?? 100;
          return (
            <div className="flex items-center gap-2 h-full">
              <span className="font-mono text-xs font-bold text-[#2B6146]">{rate}%</span>
              <div className="h-1.5 w-12 bg-[#E5E1D7] rounded-full overflow-hidden">
                <div className="h-full bg-[#438866]" style={{ width: `${rate}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        field: "availability",
        headerName: "Availability",
        width: 140,
        cellRenderer: (params: any) => {
          const a = params.value;
          const isAvail = a === "Available";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[11px] font-medium leading-none border ${
                  isAvail
                    ? "bg-[#438866]/15 text-[#2B6146] border-[#438866]/30"
                    : "bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30"
                }`}
              >
                {a}
              </span>
            </div>
          );
        },
      },
      {
        field: "totalCompletedTasks",
        headerName: "Completed",
        width: 110,
        valueGetter: (params) => `${params.data?.totalCompletedTasks ?? 0} tasks`,
      },
      {
        field: "earnings",
        headerName: "Total Earned",
        width: 120,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            <span className="inline-flex items-center justify-center h-5 font-mono text-xs font-bold leading-none text-[#2B6146] bg-[#438866]/10 px-2 rounded-md border border-[#438866]/20">
              {params.value}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <DataGrid<CommandWorkforceRow>
      rowData={workforce}
      columnDefs={columnDefs}
      title="Verified Human Workforce Directory"
      subtitle="Audited specialists, verified technical levels, active workloads, and completion track records"
      height={height}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowSelect={onSelectSpecialist}
      exportFileName="trusttopay-workforce-directory.csv"
    />
  );
}
