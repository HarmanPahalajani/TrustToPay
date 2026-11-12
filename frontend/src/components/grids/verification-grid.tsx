import React, { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import type { CommandVerificationRow } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";
import { formatDate } from "@/lib/format";

interface VerificationGridProps {
  verifications: CommandVerificationRow[] | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectVerification?: (verification: CommandVerificationRow | null) => void;
  height?: string | number;
}

export function VerificationGrid({
  verifications,
  isLoading = false,
  error = null,
  onRetry,
  onSelectVerification,
  height = "480px",
}: VerificationGridProps) {
  const columnDefs = useMemo<ColDef<CommandVerificationRow>[]>(
    () => [
      {
        field: "taskTitle",
        headerName: "Task Submission",
        minWidth: 220,
        flex: 1.4,
        cellRenderer: (params: any) => {
          const row: CommandVerificationRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722] truncate" title={row.taskTitle}>
                {row.taskTitle}
              </span>
              <span className="text-[11px] text-[#69736D]">Human: {row.human}</span>
            </div>
          );
        },
      },
      {
        field: "aiAgent",
        headerName: "Requesting AI Agent",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            <span className="text-xs font-medium text-[#202722]">{params.value}</span>
          </div>
        ),
      },
      {
        field: "verificationType",
        headerName: "Pipeline Checks",
        minWidth: 200,
        flex: 1.2,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-1.5 h-full">
            <ShieldCheck className="size-3.5 text-[#365FEA]" />
            <span className="text-xs text-[#4B554F] font-mono">{params.value}</span>
          </div>
        ),
      },
      {
        field: "testCasesPassed",
        headerName: "Test Cases",
        width: 140,
        valueGetter: (params) =>
          `${params.data?.testCasesPassed ?? 0} pass / ${params.data?.testCasesFailed ?? 0} fail`,
        cellRenderer: (params: any) => {
          const row: CommandVerificationRow = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-1.5 h-full font-mono text-xs">
              <span className="text-[#2B6146] font-bold">{row.testCasesPassed}✓</span>
              <span>/</span>
              <span className={row.testCasesFailed > 0 ? "text-[#E5484D] font-bold" : "text-[#8E9790]"}>
                {row.testCasesFailed}✗
              </span>
            </div>
          );
        },
      },
      {
        field: "finalDecision",
        headerName: "Quality Verdict",
        width: 140,
        cellRenderer: (params: any) => {
          const d = params.value;
          const isApp = d === "APPROVED" || d === "PASSED";
          const isRej = d === "REJECTED";
          return (
            <div className="flex items-center gap-1.5 h-full">
              {isApp ? (
                <CheckCircle2 className="size-3.5 text-[#438866]" />
              ) : isRej ? (
                <XCircle className="size-3.5 text-[#E5484D]" />
              ) : (
                <ShieldAlert className="size-3.5 text-[#C97A2E]" />
              )}
              <span
                className={`text-xs font-bold ${
                  isApp ? "text-[#2B6146]" : isRej ? "text-[#E5484D]" : "text-[#C97A2E]"
                }`}
              >
                {d}
              </span>
            </div>
          );
        },
      },
      {
        field: "decisionReason",
        headerName: "Decision Reason",
        minWidth: 200,
        flex: 1.3,
        cellRenderer: (params: any) => (
          <div className="flex items-center h-full">
            <span className="text-xs text-[#4B554F] truncate" title={params.value}>
              {params.value || "All verification criteria satisfied"}
            </span>
          </div>
        ),
      },
      {
        headerName: "Details",
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const row: CommandVerificationRow = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center h-full">
              <Link
                to={`/app/tasks/${row.taskId}/verification`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#365FEA] hover:underline"
              >
                Audit <ArrowUpRight className="size-3" />
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataGrid<CommandVerificationRow>
      rowData={verifications}
      columnDefs={columnDefs}
      title="Code Quality & Verification Inspection Ledger"
      subtitle="Deterministic AST validation, isolated test runner execution, and Gemini L2 security gate decisions"
      height={height}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowSelect={onSelectVerification}
      exportFileName="trusttopay-quality-verifications.csv"
    />
  );
}
