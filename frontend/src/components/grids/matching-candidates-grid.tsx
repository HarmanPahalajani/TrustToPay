import React, { useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CheckCircle2,
  Clock,
  Gauge,
  Info,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import type { RankedSpecialistCandidate, TaskMatchingDetail } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchingCandidatesGridProps {
  taskId: string;
  title?: string;
  subtitle?: string;
  height?: string | number;
  onSelectCandidate?: (candidate: RankedSpecialistCandidate | null) => void;
}

export function MatchingCandidatesGrid({
  taskId,
  title = "AI Specialist Matching Engine — Top Algorithmic Matches",
  subtitle = "Live multi-factor ranking from the TrustToPay algorithmic matching engine",
  height = "420px",
  onSelectCandidate,
}: MatchingCandidatesGridProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<RankedSpecialistCandidate | null>(null);

  const query = useQuery<TaskMatchingDetail>({
    queryKey: ["matching-detail", taskId],
    queryFn: () => api.dashboards.taskMatching(taskId),
    enabled: Boolean(taskId),
  });

  const candidates = query.data?.ranking?.eligible ?? [];
  const excluded = query.data?.ranking?.excluded ?? [];

  const handleRowSelect = (candidate: RankedSpecialistCandidate | null) => {
    setSelectedCandidate(candidate);
    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
  };

  const columnDefs = useMemo<ColDef<RankedSpecialistCandidate>[]>(
    () => [
      {
        headerName: "Rank",
        width: 80,
        minWidth: 70,
        valueGetter: (params) => {
          if (!params.node || params.node.rowIndex === null || params.node.rowIndex === undefined) return "";
          return `#${params.node.rowIndex + 1}`;
        },
        cellRenderer: (params: any) => {
          const rank = (params.node?.rowIndex ?? 0) + 1;
          const isTop = rank === 1;
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center font-mono text-xs font-bold rounded-full size-6 ${
                  isTop
                    ? "bg-[#438866]/15 text-[#2B6146] border border-[#438866]/30"
                    : "bg-[#F7F5EF] text-[#69736D]"
                }`}
              >
                {rank}
              </span>
            </div>
          );
        },
      },
      {
        field: "name",
        headerName: "Specialist Candidate",
        minWidth: 200,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const row: RankedSpecialistCandidate = params.data;
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
        headerName: "Match Score",
        field: "score",
        minWidth: 160,
        flex: 1,
        sort: "desc",
        cellRenderer: (params: any) => {
          const score = Number(params.value ?? 0);
          const colorClass =
            score >= 75
              ? "text-[#2B6146] bg-[#438866]/10 border-[#438866]/30"
              : score >= 50
                ? "text-[#C97A2E] bg-[#C97A2E]/10 border-[#C97A2E]/30"
                : "text-[#69736D] bg-[#F7F5EF] border-[#E5E1D7]";
          return (
            <div className="flex items-center gap-2 h-full">
              <span className={`inline-flex items-center justify-center h-5 px-2 font-mono text-xs font-bold leading-none rounded-md border ${colorClass}`}>
                {score.toFixed(1)}%
              </span>
              <div className="flex-1 max-w-[70px] hidden sm:block">
                <div className="h-1.5 w-full bg-[#E5E1D7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#365FEA] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        field: "matchedSkillName",
        headerName: "Verified Skill & Level",
        minWidth: 180,
        flex: 1,
        cellRenderer: (params: any) => {
          const row: RankedSpecialistCandidate = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="text-xs font-medium text-[#202722] truncate">{row.matchedSkillName}</span>
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#F7F5EF] px-1.5 text-[10px] font-semibold leading-none text-[#365FEA] border border-[#E5E1D7]">
                L{row.verifiedSkillLevel} ({row.verifiedSkillLevelName})
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Algorithm Signals",
        minWidth: 200,
        flex: 1.2,
        valueGetter: (params) => {
          const b = params.data?.breakdown;
          if (!b) return "";
          return `Skill: ${Math.round(b.skillSignal * 100)}% | Verif: ${Math.round(b.verificationSignal * 100)}% | Speed: ${Math.round(b.speedSignal * 100)}%`;
        },
        cellRenderer: (params: any) => {
          const b = params.data?.breakdown;
          if (!b) return null;
          return (
            <div className="flex items-center gap-1.5 h-full text-[10px]">
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#365FEA]/10 px-1.5 font-medium leading-none text-[#2B4FC7]">
                Skill {Math.round(b.skillSignal * 100)}%
              </span>
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#438866]/10 px-1.5 font-medium leading-none text-[#2B6146]">
                Pass {Math.round(b.verificationSignal * 100)}%
              </span>
              <span className="inline-flex items-center justify-center h-5 rounded bg-[#C97A2E]/10 px-1.5 font-medium leading-none text-[#C97A2E]">
                Speed {Math.round(b.speedSignal * 100)}%
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Workload",
        width: 120,
        valueGetter: (params) => {
          const s = params.data?.stats;
          return s ? `${s.activeWorkload} / ${s.maxWorkload}` : "0 / 3";
        },
        cellRenderer: (params: any) => {
          const s = params.data?.stats;
          const active = s?.activeWorkload ?? 0;
          const max = s?.maxWorkload ?? 3;
          const isFull = active >= max;
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span
                className={`inline-flex items-center justify-center h-5 text-[11px] font-medium leading-none px-2 rounded-full border ${
                  isFull
                    ? "bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30"
                    : "bg-[#438866]/15 text-[#2B6146] border-[#438866]/30"
                }`}
              >
                {active} / {max} active
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Top Matching Reason",
        field: "reasons",
        minWidth: 220,
        flex: 1.3,
        valueGetter: (params) => params.data?.reasons?.[0] ?? "Qualified match",
        cellRenderer: (params: any) => {
          const reasons = params.data?.reasons ?? [];
          const first = reasons[0] ?? "Verified level matches required proficiency";
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="text-xs text-[#4B554F] truncate" title={reasons.join(" • ")}>
                {first}
              </span>
              {reasons.length > 1 ? (
                <span className="inline-flex items-center justify-center h-4 rounded-full bg-[#F7F5EF] px-1.5 text-[10px] leading-none text-[#69736D] border border-[#E5E1D7]">
                  +{reasons.length - 1}
                </span>
              ) : null}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <DataGrid<RankedSpecialistCandidate>
        rowData={candidates}
        columnDefs={columnDefs}
        title={title}
        subtitle={subtitle}
        height={height}
        isLoading={query.isLoading}
        error={query.error ? (query.error as Error).message : null}
        onRetry={() => query.refetch()}
        onRowSelect={handleRowSelect}
        exportFileName={`task-${taskId}-matching-candidates.csv`}
        actions={
          query.data?.ranking?.discovery?.mode ? (
            <Badge tone="neutral" className="text-xs gap-1 py-1">
              <Sparkles className="size-3 text-[#365FEA]" />
              Mode: {query.data.ranking.discovery.mode}
            </Badge>
          ) : null
        }
      />

      {/* Selected Candidate Inspector Panel */}
      {selectedCandidate ? (
        <Card className="border-[#365FEA]/30 bg-[#FFFEFA] shadow-xs">
          <CardHeader className="pb-3 border-b border-[#E5E1D7]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-[#365FEA]" />
                <CardTitle className="text-sm font-semibold text-[#202722]">
                  Algorithmic Score Breakdown: {selectedCandidate.name}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#69736D]">Final Score:</span>
                <span className="rounded-md bg-[#438866]/15 border border-[#438866]/30 px-2 py-0.5 font-mono text-xs font-bold text-[#2B6146]">
                  {selectedCandidate.score.toFixed(2)} / 100
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Signals Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#E5E1D7] bg-[#F7F5EF] p-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-[#4B554F]">
                  <span className="flex items-center gap-1">
                    <Award className="size-3 text-[#365FEA]" /> Skill Proficiency
                  </span>
                  <span className="font-mono font-bold text-[#202722]">
                    {(selectedCandidate.breakdown.skillSignal * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5E1D7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#365FEA]"
                    style={{ width: `${selectedCandidate.breakdown.skillSignal * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#69736D]">
                  Verified {selectedCandidate.matchedSkillName} (Level {selectedCandidate.verifiedSkillLevel})
                </p>
              </div>

              <div className="rounded-lg border border-[#E5E1D7] bg-[#F7F5EF] p-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-[#4B554F]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-[#438866]" /> Verification Quality
                  </span>
                  <span className="font-mono font-bold text-[#202722]">
                    {(selectedCandidate.breakdown.verificationSignal * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5E1D7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#438866]"
                    style={{ width: `${selectedCandidate.breakdown.verificationSignal * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#69736D]">
                  {selectedCandidate.stats.acceptedSubmissions} verified passed /{" "}
                  {selectedCandidate.stats.rejectedSubmissions} rejected
                </p>
              </div>

              <div className="rounded-lg border border-[#E5E1D7] bg-[#F7F5EF] p-3 space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-[#4B554F]">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-[#C97A2E]" /> Speed & Availability
                  </span>
                  <span className="font-mono font-bold text-[#202722]">
                    {(selectedCandidate.breakdown.speedSignal * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5E1D7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C97A2E]"
                    style={{ width: `${selectedCandidate.breakdown.speedSignal * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#69736D]">
                  Avg turnaround:{" "}
                  {selectedCandidate.stats.avgTurnaroundMinutes !== null
                    ? `${selectedCandidate.stats.avgTurnaroundMinutes} mins`
                    : "Fast"}
                </p>
              </div>
            </div>

            {/* Matching Reasons */}
            <div className="rounded-lg border border-[#E5E1D7] bg-white p-3 space-y-2">
              <h4 className="text-xs font-semibold text-[#202722] flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#438866]" /> Algorithmic Matching Justification
              </h4>
              <ul className="space-y-1">
                {selectedCandidate.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[#4B554F] flex items-start gap-1.5">
                    <span className="text-[#365FEA] font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Excluded Candidates Summary */}
      {excluded.length > 0 ? (
        <div className="rounded-lg border border-[#E5E1D7] bg-[#FAF8F2] p-3 text-xs text-[#69736D] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="size-3.5 text-[#69736D]" />
            <span>{excluded.length} candidate(s) filtered out by eligibility guards (e.g. unverified skill or workload limit).</span>
          </span>
          <span className="font-mono text-[11px]">Strict Compliance Guarded</span>
        </div>
      ) : null}
    </div>
  );
}
