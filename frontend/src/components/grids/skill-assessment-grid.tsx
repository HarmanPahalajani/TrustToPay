import React, { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { Award, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { CommandAssessmentRow } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";
import { formatDate } from "@/lib/format";

interface SkillAssessmentGridProps {
  assessments: CommandAssessmentRow[] | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectAssessment?: (assessment: CommandAssessmentRow | null) => void;
  height?: string | number;
}

export function SkillAssessmentGrid({
  assessments,
  isLoading = false,
  error = null,
  onRetry,
  onSelectAssessment,
  height = "480px",
}: SkillAssessmentGridProps) {
  const columnDefs = useMemo<ColDef<CommandAssessmentRow>[]>(
    () => [
      {
        field: "candidate",
        headerName: "Candidate",
        minWidth: 180,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const row: CommandAssessmentRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722]">{row.candidate}</span>
              <span className="text-[11px] text-[#69736D] truncate">{row.candidateEmail}</span>
            </div>
          );
        },
      },
      {
        field: "skill",
        headerName: "Skill Domain",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          const row: CommandAssessmentRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722]">{row.skill}</span>
              <span className="text-[10px] text-[#69736D] uppercase">{row.category}</span>
            </div>
          );
        },
      },
      {
        field: "levelName",
        headerName: "Target Level",
        width: 140,
        cellRenderer: (params: any) => {
          const row: CommandAssessmentRow = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-1.5 h-full">
              <Award className="size-3.5 text-[#365FEA]" />
              <span className="text-xs font-semibold text-[#202722]">
                L{row.level} ({row.levelName})
              </span>
            </div>
          );
        },
      },
      {
        field: "score",
        headerName: "Assessed Score",
        width: 130,
        sort: "desc",
        cellRenderer: (params: any) => {
          const raw = params.data?.scoreRaw ?? 0;
          const isPassed = raw >= 70;
          return (
            <div className="flex items-center gap-2 h-full">
              <span
                className={`inline-flex items-center justify-center h-5 font-mono text-xs font-bold leading-none px-2 rounded-md border ${
                  isPassed
                    ? "bg-[#438866]/10 text-[#2B6146] border-[#438866]/30"
                    : "bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/30"
                }`}
              >
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "practicalTestResult",
        headerName: "Practical Test",
        width: 130,
        cellRenderer: (params: any) => {
          const res = params.value;
          const isPassed = res === "Passed";
          return (
            <div className="flex items-center gap-1.5 h-full text-xs">
              {isPassed ? (
                <CheckCircle2 className="size-3.5 text-[#438866]" />
              ) : (
                <XCircle className="size-3.5 text-[#E5484D]" />
              )}
              <span className={isPassed ? "text-[#2B6146] font-medium" : "text-[#E5484D]"}>{res}</span>
            </div>
          );
        },
      },
      {
        field: "hiddenTestResult",
        headerName: "Hidden Test Suite",
        width: 140,
        cellRenderer: (params: any) => {
          const res = params.value;
          const isPassed = res?.includes("Passed");
          return (
            <div className="flex items-center gap-1.5 h-full text-xs">
              <span
                className={`inline-flex items-center justify-center h-5 px-2 rounded-md font-mono text-[11px] font-semibold leading-none ${
                  isPassed ? "bg-[#438866]/15 text-[#2B6146]" : "bg-[#E5484D]/15 text-[#E5484D]"
                }`}
              >
                {res}
              </span>
            </div>
          );
        },
      },
      {
        field: "certificationStatus",
        headerName: "Certification Status",
        width: 140,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isCert = status === "CERTIFIED";
          const isCool = status === "COOLDOWN";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[10px] font-bold leading-none border ${
                  isCert
                    ? "bg-[#438866]/15 text-[#2B6146] border-[#438866]/30"
                    : isCool
                      ? "bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30"
                      : "bg-[#F7F5EF] text-[#69736D] border-[#E5E1D7]"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        field: "assessmentDate",
        headerName: "Date",
        width: 110,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : "—"),
      },
    ],
    [],
  );

  return (
    <DataGrid<CommandAssessmentRow>
      rowData={assessments}
      columnDefs={columnDefs}
      title="Skill Assessment & 3-Level Certification Registry"
      subtitle="Evaluated practical coding challenges, hidden unit tests, and sequential qualification milestones"
      height={height}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowSelect={onSelectAssessment}
      exportFileName="trusttopay-skill-assessments.csv"
    />
  );
}
