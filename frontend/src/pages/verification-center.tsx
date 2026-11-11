import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  RefreshCw,
  ShieldCheck,
  Terminal,
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
    onError: (err) => setError(err instanceof ApiError ? err.message : "Verification action failed."),
  });

  const task = query.data?.task;
  if (query.isLoading) return <LoadingBlock label="Loading verification record…" />;
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
          { label: "Verification" },
        ]}
        title="Work verification report"
        description="Automated quality and security checks run independently from payment settlement before verified results return to the requesting agent."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/app/tasks/${task.id}`}>
                <ArrowLeft className="size-4" /> Back to task
              </Link>
            </Button>
            {isAdmin ? (
              <Button variant="outline" onClick={() => verify.mutate({})} loading={verify.isPending}>
                <RefreshCw className="size-4" /> Re-run checks
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
              <Card className={latest.status === "PASSED" ? "border-[#12A875]/35" : undefined}>
                <CardHeader className="border-b border-[#E4E9F2] pb-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Award className="size-4 text-[#12A875]" /> Latest verification check
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
                  <p className="text-sm leading-6 text-[#141B2D]">{latest.decisionReason}</p>
                  {latest.artifactSha256 ? (
                    <div className="rounded-xl bg-[#F5F7FC] p-3.5 text-xs">
                      <span className="font-semibold text-[#68738A]">File integrity check (SHA-256): </span>
                      <span className="break-all font-mono text-[11px] text-[#141B2D]">
                        {latest.artifactSha256}
                      </span>
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="Checks passed" value={latest.checksPassed.length} tone="success" />
                    <Metric
                      label="Checks failed"
                      value={latest.checksFailed.length}
                      tone={latest.checksFailed.length > 0 ? "danger" : "neutral"}
                    />
                    <Metric
                      label="Critical blockers"
                      value={latest.checksFailed.filter((check) => check.severity === "HARD").length}
                      tone={latest.checksFailed.some((check) => check.severity === "HARD") ? "danger" : "neutral"}
                    />
                  </div>
                </CardContent>
              </Card>

              {latest.securityReview ? (
                <Card>
                  <CardHeader className="border-b border-[#E4E9F2] pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="size-4 text-[#4263EB]" /> Security checks
                      </CardTitle>
                      <SecurityVerdictBadge verdict={latest.securityReview.verdict} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <p className="leading-5 text-[#141B2D]">{latest.securityReview.summary}</p>
                    {latest.securityReview.gemini ? (
                      <div className="rounded-xl bg-[#F5F7FC] p-3.5">
                        <p className="font-semibold text-[#141B2D]">
                          AI security inspection ({latest.securityReview.gemini.model}) ·{" "}
                          <span className="tabular-nums">
                            {Math.round(latest.securityReview.gemini.confidence * 100)}%
                          </span>{" "}
                          confidence
                        </p>
                        <p className="mt-1 leading-5 text-[#4E596E]">{latest.securityReview.gemini.summary}</p>
                      </div>
                    ) : null}
                    {latest.securityReview.deterministic.findings.length > 0 ? (
                      <div className="space-y-2 border-t border-[#E4E9F2] pt-3">
                        <p className="text-xs font-semibold text-[#68738A]">
                          Automated security findings ({latest.securityReview.deterministic.findings.length})
                        </p>
                        {latest.securityReview.deterministic.findings.map((finding, idx) => (
                          <div
                            key={`${finding.ruleId}-${idx}`}
                            className="rounded-lg bg-[#F5A623]/[0.1] p-3 text-[#141B2D]"
                          >
                            <p className="font-semibold text-[#9A6100]">
                              [{finding.severity}] {finding.ruleId} — {finding.message}
                            </p>
                            {finding.filePath ? (
                              <p className="mt-1 font-mono text-[11px] text-[#68738A]">File: {finding.filePath}</p>
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
                  <CardHeader className="border-b border-[#E4E9F2] pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Terminal className="size-4 text-[#4263EB]" /> Work verification summary
                      </CardTitle>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={latest.executionSummary.passed ? "success" : "danger"} dot>
                          {latest.executionSummary.verdict}
                        </Badge>
                        <Badge tone="neutral">{latest.executionSummary.mode}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-xs">
                    <p className="text-[#141B2D]">{latest.executionSummary.summary}</p>
                    <p className="text-xs text-[#68738A] tabular-nums">
                      Exit code: <span className="font-mono">{latest.executionSummary.exitCode ?? "—"}</span> · Duration:{" "}
                      {latest.executionSummary.durationMs}ms · Network:{" "}
                      {latest.executionSummary.limits.networkAccess} · Memory cap:{" "}
                      {latest.executionSummary.limits.maxMemoryMb}MB
                    </p>
                    {latest.executionSummary.stdout ? (
                      <pre className="max-h-48 overflow-auto rounded-lg bg-[#10172A] p-3 font-mono text-[11px] text-[#E2E8F0]">
                        {latest.executionSummary.stdout}
                      </pre>
                    ) : null}
                    {latest.executionSummary.stderr ? (
                      <pre className="max-h-48 overflow-auto rounded-lg bg-[#E5484D]/[0.08] p-3 font-mono text-[11px] text-[#C1282D]">
                        {latest.executionSummary.stderr}
                      </pre>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              <CheckList run={latest} />

              {latest.evidenceReferences.length > 0 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileSearch className="size-4 text-[#4263EB]" /> Evidence references
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-[#E4E9F2] pt-0">
                    {latest.evidenceReferences.map((reference, index) => (
                      <div
                        key={`${reference.label}-${index}`}
                        className="py-3 first:pt-1 last:pb-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#141B2D]">{reference.label}</p>
                          {reference.url ? (
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#4263EB] underline"
                            >
                              Open source <ExternalLink className="size-3" />
                            </a>
                          ) : null}
                        </div>
                        {reference.quote ? (
                          <blockquote className="mt-2 rounded-lg bg-[#F5F7FC] p-2.5 text-xs italic text-[#4E596E]">
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
                    <CardTitle className="text-sm">Previous check runs</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-[#E4E9F2] pt-0">
                    {runs.slice(1).map((run) => (
                      <div
                        key={run.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <VerificationBadge status={run.status} />
                          <span className="text-xs text-[#68738A]">{run.engine}</span>
                        </div>
                        <span className="text-xs text-[#68738A] tabular-nums">
                          {formatDate(run.createdAt)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <Alert tone="info">
              No verification run exists for this task yet. The assigned specialist must submit an artifact.
            </Alert>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Task under verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-heading text-sm font-semibold text-[#141B2D]">{task.title}</p>
              <dl>
                <DataRow label="Task status">{taskStatusLabel(task.status)}</DataRow>
                <DataRow label="Reward">{formatMoney(task.rewardMinor, task.currency)}</DataRow>
                <DataRow label="Specialist">{task.assignment?.reviewer.name ?? "Unassigned"}</DataRow>
                <DataRow label="Requester">{task.requester?.name ?? "Unknown"}</DataRow>
              </dl>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/app/tasks/${task.id}`}>Open task workspace</Link>
              </Button>
            </CardContent>
          </Card>

          {submission ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Submitted answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="whitespace-pre-line text-xs leading-5 text-[#141B2D]">{submission.answer}</p>
                <div className="border-t border-[#E4E9F2] pt-2.5">
                  <p className="text-xs font-semibold text-[#68738A]">
                    Evidence notes
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#4E596E]">
                    {submission.evidenceNotes ?? "None supplied."}
                  </p>
                </div>
                <p className="text-xs text-[#68738A] tabular-nums">
                  Confidence {submission.confidenceScore}% · {formatDate(submission.createdAt)}
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
          ? "bg-[#12A875]/[0.08]"
          : tone === "danger"
            ? "bg-[#E5484D]/[0.08]"
            : "bg-[#F5F7FC]",
      )}
    >
      <p className="text-xs font-medium text-[#68738A]">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-[#141B2D] tabular-nums">{value}</p>
    </div>
  );
}

function CheckList({ run }: { run: VerificationRun }) {
  return (
    <Card>
      <CardHeader className="border-b border-[#E4E9F2] pb-3">
        <CardTitle className="text-sm">Work verification checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div>
          <SectionHeading
            title={`Passed (${run.checksPassed.length})`}
            description="Checks satisfied by the submitted work and notes."
          />
          <div className="mt-2.5 space-y-2">
            {run.checksPassed.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-2.5 rounded-lg bg-[#12A875]/[0.07] p-3 text-xs"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                <div>
                  <p className="font-bold text-[#141B2D]">{check.label}</p>
                  <p className="mt-0.5 text-[#4E596E]">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            title={`Failed (${run.checksFailed.length})`}
            description="Critical issues must be fixed before verification passes."
          />
          {run.checksFailed.length === 0 ? (
            <p className="mt-2 rounded-lg bg-[#F5F7FC] p-3 text-xs text-[#68738A]">
              All verification checks passed.
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
                    <p className="font-bold text-[#141B2D]">{check.label}</p>
                    <p className="mt-0.5 text-[#4E596E]">{check.detail}</p>
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
