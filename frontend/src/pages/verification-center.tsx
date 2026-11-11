import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { VerificationRun } from "@/lib/types";
import { PageHeader, SectionHeading, DataRow } from "@/components/common";
import { VerificationBadge, SecurityVerdictBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatMoney } from "@/lib/format";
import { taskStatusLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

export default function VerificationCenterPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.tasks.get(id),
    enabled: Boolean(id),
  });

  const verify = useMutation({
    mutationFn: (input: Parameters<typeof api.tasks.verify>[1]) => api.tasks.verify(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["task", id] });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update safety check."),
  });

  const task = query.data?.task;
  if (query.isLoading) return <LoadingBlock label="Loading safety check report…" />;
  if (query.error || !task) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "Task not found."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const runs = task.verificationRuns ?? [];
  const latest = runs[0] ?? null;
  const submission = task.submissions?.[0] ?? null;
  const isAdmin = false;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Task Detail", to: `/app/tasks/${task.id}` },
          { label: "Safety & Quality Check" },
        ]}
        title="Safety & quality review"
        description="Automatic quality and safety checks run before completed work is returned."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/app/tasks/${task.id}`}>
                <ArrowLeft className="size-4" /> Back to task
              </Link>
            </Button>
            {isAdmin ? (
              <Button variant="outline" onClick={() => verify.mutate({})} loading={verify.isPending}>
                <RefreshCw className="size-4" /> Check submitted work
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          {latest ? (
            <>
              <Card className={latest.status === "PASSED" ? "border-[#438866]/35" : undefined}>
                <CardHeader className="border-b border-[#E5E1D7] pb-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="size-4 text-[#438866]" /> Check submitted work
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <VerificationBadge status={latest.status} />
                      {latest.securityVerdict ? (
                        <SecurityVerdictBadge verdict={latest.securityVerdict} />
                      ) : null}
                      {latest.artifactVersion ? (
                        <Badge tone="neutral">Submission v{latest.artifactVersion}</Badge>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-sm leading-6 text-[#202722]">{latest.decisionReason}</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Passed checks" value={latest.checksPassed.length} tone="success" />
                    <Metric
                      label="Issues found"
                      value={latest.checksFailed.length}
                      tone={latest.checksFailed.length > 0 ? "danger" : "neutral"}
                    />
                    <Metric
                      label="Blocking issues"
                      value={latest.checksFailed.filter((check) => check.severity === "HARD").length}
                      tone={latest.checksFailed.some((check) => check.severity === "HARD") ? "danger" : "neutral"}
                    />
                  </div>
                </CardContent>
              </Card>

              {latest.securityReview ? (
                <Card>
                  <CardHeader className="border-b border-[#E5E1D7] pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="size-4 text-[#365FEA]" /> Automatic safety checks
                      </CardTitle>
                      <SecurityVerdictBadge verdict={latest.securityReview.verdict} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <p className="leading-5 text-[#202722]">{latest.securityReview.summary}</p>
                    {latest.securityReview.gemini ? (
                      <div className="rounded-xl bg-[#F0EEE7] p-3.5">
                        <p className="font-semibold text-[#202722]">
                          AI safety review ·{" "}
                          <span className="tabular-nums">
                            {Math.round(latest.securityReview.gemini.confidence * 100)}%
                          </span>{" "}
                          confidence
                        </p>
                        <p className="mt-1 leading-5 text-[#69736D]">{latest.securityReview.gemini.summary}</p>
                      </div>
                    ) : null}
                    {latest.securityReview.deterministic.findings.length > 0 ? (
                      <div className="space-y-2 border-t border-[#E5E1D7] pt-3">
                        <p className="text-xs font-semibold text-[#69736D]">
                          Safety review findings ({latest.securityReview.deterministic.findings.length})
                        </p>
                        {latest.securityReview.deterministic.findings.map((finding, idx) => (
                          <div
                            key={`${finding.ruleId}-${idx}`}
                            className="rounded-lg bg-[#C97A2E]/[0.1] p-3 text-[#202722]"
                          >
                            <p className="font-semibold text-[#8E5219]">{finding.message}</p>
                            {finding.filePath ? (
                              <p className="mt-1 text-[11px] text-[#69736D]">File: {finding.filePath}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              {latest.executionSummary ? (
                <Card>
                  <CardHeader className="border-b border-[#E5E1D7] pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ClipboardCheck className="size-4 text-[#365FEA]" /> Quality summary
                      </CardTitle>
                      <Badge tone={latest.executionSummary.passed ? "success" : "danger"} dot>
                        {latest.executionSummary.passed ? "Passed" : "Needs attention"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <p className="leading-5 text-[#202722]">{latest.executionSummary.summary}</p>
                  </CardContent>
                </Card>
              ) : null}

              <CheckList run={latest} />

              {latest.evidenceReferences.length > 0 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileSearch className="size-4 text-[#365FEA]" /> Supporting sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-[#E5E1D7] pt-0">
                    {latest.evidenceReferences.map((reference, index) => (
                      <div key={`${reference.label}-${index}`} className="py-3 first:pt-1 last:pb-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#202722]">{reference.label}</p>
                          {reference.url ? (
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#365FEA] underline"
                            >
                              Open source <ExternalLink className="size-3" />
                            </a>
                          ) : null}
                        </div>
                        {reference.quote ? (
                          <blockquote className="mt-2 rounded-lg bg-[#F0EEE7] p-2.5 text-xs italic text-[#69736D]">
                            “{reference.quote}”
                          </blockquote>
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              {runs.length > 1 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Earlier review checks</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-[#E5E1D7] pt-0">
                    {runs.slice(1).map((run) => (
                      <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <VerificationBadge status={run.status} />
                        <span className="text-xs text-[#69736D] tabular-nums">{formatDate(run.createdAt)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <Alert tone="info">
              No safety review has run yet. Checks begin automatically once the specialist submits their work.
            </Alert>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Task summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-heading text-sm font-semibold text-[#202722]">{task.title}</p>
              <dl>
                <DataRow label="Status">{taskStatusLabel(task.status)}</DataRow>
                <DataRow label="Budget">{formatMoney(task.rewardMinor, task.currency)}</DataRow>
                <DataRow label="Specialist">{task.assignment?.reviewer.name ?? "Not assigned yet"}</DataRow>
                <DataRow label="Requester">{task.requester?.name ?? "Unknown"}</DataRow>
              </dl>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/app/tasks/${task.id}`}>Open task details</Link>
              </Button>
            </CardContent>
          </Card>

          {submission ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Submitted work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="whitespace-pre-line text-xs leading-5 text-[#202722]">{submission.answer}</p>
                <div className="border-t border-[#E5E1D7] pt-2.5">
                  <p className="text-xs font-semibold text-[#69736D]">Supporting notes</p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#69736D]">
                    {submission.evidenceNotes ?? "None provided."}
                  </p>
                </div>
                <p className="text-xs text-[#69736D] tabular-nums">
                  {submission.confidenceScore}% confidence · {formatDate(submission.createdAt)}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "neutral" }) {
  return (
    <div
      className={cn(
        "rounded-xl p-4",
        tone === "success"
          ? "bg-[#438866]/[0.09]"
          : tone === "danger"
            ? "bg-[#E5484D]/[0.08]"
            : "bg-[#F0EEE7]",
      )}
    >
      <p className="text-xs font-medium text-[#69736D]">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-[#202722] tabular-nums">{value}</p>
    </div>
  );
}

function CheckList({ run }: { run: VerificationRun }) {
  return (
    <Card>
      <CardHeader className="border-b border-[#E5E1D7] pb-3">
        <CardTitle className="text-sm">Checklist details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div>
          <SectionHeading
            title={`Passed (${run.checksPassed.length})`}
            description="Requirements confirmed in the submitted work."
          />
          <div className="mt-2.5 space-y-2">
            {run.checksPassed.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-2.5 rounded-lg bg-[#438866]/[0.08] p-3 text-xs"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#438866]" />
                <div>
                  <p className="font-bold text-[#202722]">{check.label}</p>
                  <p className="mt-0.5 text-[#69736D]">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            title={`Issues (${run.checksFailed.length})`}
            description="Items that need attention before the task can finish."
          />
          {run.checksFailed.length === 0 ? (
            <p className="mt-2 rounded-lg bg-[#F0EEE7] p-3 text-xs text-[#69736D]">
              No issues found. All checks passed.
            </p>
          ) : (
            <div className="mt-2.5 space-y-2">
              {run.checksFailed.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2.5 rounded-lg bg-[#E5484D]/[0.07] p-3 text-xs"
                >
                  <XCircle className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  <div>
                    <p className="font-bold text-[#202722]">{check.label}</p>
                    <p className="mt-0.5 text-[#69736D]">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
