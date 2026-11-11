import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  Sparkles,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AnalysisOutput, Conflict, EvidenceSource } from "@/lib/types";
import { PageHeader, SectionHeading } from "@/components/common";
import { TaskRowCard } from "@/components/task-card";
import { RiskBadge, StatusBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { categoryLabel, defaultCriteriaFor, normalizeCategoryValue } from "@/lib/categories";
import { formatDate, formatMoney, humanize, parseMoneyToMinor } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SessionDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["session", id],
    queryFn: () => api.sessions.get(id),
    enabled: Boolean(id),
  });

  const analyze = useMutation({
    mutationFn: () => api.sessions.analyze(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session", id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setNotice("Task summary updated.");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not run check."),
  });

  const resume = useMutation({
    mutationFn: () => api.sessions.resume(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session", id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setNotice("Completed work has been confirmed and returned.");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not complete this step."),
  });

  const createTask = useMutation({
    mutationFn: (input: Parameters<typeof api.tasks.create>[0]) => api.tasks.create(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["session", id] });
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(`/app/tasks/${data.task.id}`);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create task."),
  });

  if (query.isLoading) return <LoadingBlock label="Loading task details…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "Task request not found."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const session = query.data.session;
  const tasks = session.tasks ?? [];
  const latest = session.analysisRuns?.[0];
  const output = latest?.output;
  const hasVerifiedTask = tasks.some((t) =>
    ["VERIFIED", "PAYMENT_READY", "PAYMENT_PAID", "COMPLETED"].includes(t.status),
  );
  const canResume = hasVerifiedTask && !session.resolvedAt;
  const canCreateTask = tasks.length === 0 && Boolean(output);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "New Task", to: "/app/workspace" },
          { label: session.title },
        ]}
        title={session.title}
        description={session.question}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/workspace">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" onClick={() => analyze.mutate()} loading={analyze.isPending}>
              <Sparkles className="size-4 text-[#365FEA]" /> Check details
            </Button>
            {canResume ? (
              <Button onClick={() => resume.mutate()} loading={resume.isPending}>
                <CheckCircle2 className="size-4" /> Confirm completed work
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <StatusBadge status={session.status} />
        <Badge tone="neutral">{categoryLabel(session.category)}</Badge>
        <span className="text-xs text-[#69736D] tabular-nums">Created {formatDate(session.createdAt)}</span>
        {session.resolvedAt ? (
          <Badge tone="success" dot>
            Completed {formatDate(session.resolvedAt)}
          </Badge>
        ) : null}
      </div>

      {session.finalAnswer ? (
        <Alert tone="success" icon={<CheckCircle2 className="size-4 text-[#438866]" />} title="Completed work ready">
          <p className="mt-1 whitespace-pre-line text-xs leading-6 text-[#202722]">{session.finalAnswer}</p>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          {output && latest ? (
            <AnalysisCard output={output} latest={latest} />
          ) : (
            <Card className="p-6 text-center">
              <Bot className="mx-auto size-7 text-[#365FEA]" />
              <h3 className="mt-2 font-display text-sm font-bold text-[#202722]">No summary generated yet</h3>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#69736D]">
                Run a quick check to spot missing information and prepare suggested skills and budget.
              </p>
              <Button size="sm" className="mt-4" onClick={() => analyze.mutate()} loading={analyze.isPending}>
                <Sparkles className="size-3.5" /> Check details
              </Button>
            </Card>
          )}

          {tasks.length > 0 ? (
            <div className="space-y-3">
              <SectionHeading
                title={`Active tasks (${tasks.length})`}
                description="Track specialist matching, payment status, safety checks, and completed work."
              />
              {tasks.map((task) => (
                <TaskRowCard key={task.id} task={task} />
              ))}
            </div>
          ) : null}

          <EvidenceCard evidence={session.evidence ?? []} />
        </div>

        <aside className="space-y-5">
          {canCreateTask && output ? (
            <CreateTaskCard
              sessionId={session.id}
              category={session.category}
              output={output}
              productModels={session.productModels}
              onSubmit={(input) => createTask.mutate(input)}
              submitting={createTask.isPending}
            />
          ) : null}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Included details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-xs font-medium text-[#69736D]">
                  Tools &amp; topics mentioned
                </p>
                {session.productModels.length === 0 ? (
                  <p className="mt-1 text-[#69736D]">None listed.</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {session.productModels.map((model) => (
                      <Badge key={model} tone="neutral">
                        {model}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E1D7] pt-3">
                <p className="text-xs font-medium text-[#69736D]">
                  Requirements ({session.specifications.length})
                </p>
                {session.specifications.length === 0 ? (
                  <p className="mt-1 text-[#69736D]">No specific requirements added.</p>
                ) : (
                  <ul className="mt-1.5 space-y-1 text-[#69736D]">
                    {session.specifications.map((spec, idx) => (
                      <li key={idx}>• {spec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AnalysisCard({
  output,
  latest,
}: {
  output: AnalysisOutput;
  latest: NonNullable<Awaited<ReturnType<typeof api.sessions.get>>["session"]["analysisRuns"]>[number];
}) {
  const confidence = Math.round(output.confidenceScore * 100);
  const actionTone =
    output.recommendedAction === "ESCALATE_TO_HUMAN"
      ? "warning"
      : output.recommendedAction === "REQUEST_MORE_INFORMATION"
        ? "info"
        : "success";

  return (
    <Card>
      <CardHeader className="border-b border-[#E5E1D7] pb-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="size-4 text-[#365FEA]" /> Task summary
          </CardTitle>
          <Badge tone={actionTone} dot>
            {humanize(output.recommendedAction)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <p className="text-sm leading-6 text-[#202722]">{output.summary}</p>

        <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
          <div className="rounded-xl bg-[#F0EEE7] p-4">
            <p className="text-xs font-medium text-[#69736D]">Clarity score</p>
            <p
              className={cn(
                "mt-1 font-sans text-[28px] font-bold leading-none tabular-nums",
                confidence >= 75 ? "text-[#438866]" : confidence >= 50 ? "text-[#8E5219]" : "text-[#E5484D]",
              )}
            >
              {confidence}%
            </p>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#E5E1D7]">
              <div
                className={cn(
                  "h-full rounded-full",
                  confidence >= 75 ? "bg-[#438866]" : confidence >= 50 ? "bg-[#C97A2E]" : "bg-[#E5484D]",
                )}
                style={{ width: `${Math.max(4, confidence)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-[#69736D] tabular-nums">
              Target {Math.round(latest.threshold * 100)}%
            </p>
          </div>

          <div className="rounded-xl bg-[#F0EEE7] p-4">
            <p className="text-xs font-medium text-[#69736D]">Why a specialist helps</p>
            <p className="mt-1 text-sm font-medium leading-5 text-[#202722]">{output.escalationReason}</p>
            <p className="mt-2 text-xs leading-5 text-[#69736D]">{output.reasoningSummary}</p>
          </div>
        </div>

        {output.proposedAnswer ? (
          <div>
            <SectionHeading
              title="Initial notes"
              description="Preliminary draft prepared before a human specialist completes the task."
            />
            <div className="mt-2 rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-3.5 text-xs leading-6 text-[#202722]">
              {output.proposedAnswer}
            </div>
          </div>
        ) : null}

        {output.conflictingClaims.length > 0 ? (
          <div>
            <SectionHeading
              title="Conflicting details"
              description="Points that need human judgment to resolve."
            />
            <div className="mt-2 space-y-2.5">
              {output.conflictingClaims.map((conflict, index) => (
                <ConflictRow key={`${conflict.claimA}-${index}`} conflict={conflict} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#202722]">
              <AlertTriangle className="size-3.5 text-[#C97A2E]" /> Open questions
            </p>
            {output.uncertainties.length === 0 ? (
              <p className="text-xs text-[#69736D]">None listed.</p>
            ) : (
              <ul className="space-y-1 text-xs leading-5 text-[#69736D]">
                {output.uncertainties.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#202722]">
              <CircleHelp className="size-3.5 text-[#365FEA]" /> Missing details
            </p>
            {output.missingInformation.length === 0 ? (
              <p className="text-xs text-[#69736D]">None listed.</p>
            ) : (
              <ul className="space-y-1 text-xs leading-5 text-[#69736D]">
                {output.missingInformation.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#F0EEE7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#69736D]">
                Suggested budget
              </p>
              <p className="mt-0.5 text-lg font-bold text-[#202722] tabular-nums">
                {formatMoney(output.suggestedReward.amountMinor, output.suggestedReward.currency)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {output.suggestedReviewerSkills.map((skill) => (
                <Badge key={skill} tone="indigo">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#69736D]">{output.suggestedReward.rationale}</p>
        </div>

        {output.evidence.length > 0 ? (
          <div>
            <SectionHeading
              title="Attached notes review"
              description="Summary of the supporting materials shared with this task."
            />
            <div className="mt-2 space-y-2">
              {output.evidence.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#202722]">{item.title}</p>
                    <div className="flex gap-1.5">
                      <Badge
                        tone={
                          item.strength === "STRONG"
                            ? "success"
                            : item.strength === "MODERATE"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {item.strength}
                      </Badge>
                      <Badge tone={item.supportsAnswer ? "success" : "neutral"}>
                        {item.supportsAnswer ? "Supports" : "Unconfirmed"}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#69736D]">{item.excerpt}</p>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#365FEA] underline underline-offset-2"
                    >
                      {item.publisher ?? item.url} <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ConflictRow({ conflict }: { conflict: Conflict }) {
  return (
    <div className="rounded-xl border border-[#C97A2E]/40 bg-[#C97A2E]/[0.07] p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#8E5219]">Conflict · {conflict.severity}</p>
        {conflict.severity === "CRITICAL" ? <Badge tone="danger">Needs confirmation</Badge> : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-[#202722]">{conflict.detail}</p>
      <div className="mt-2.5 grid gap-2 text-xs leading-5 sm:grid-cols-2">
        <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-2.5">
          <p className="font-semibold text-[#202722]">{conflict.sourceA}</p>
          <p className="mt-0.5 text-[#69736D]">“{conflict.claimA}”</p>
        </div>
        <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-2.5">
          <p className="font-semibold text-[#202722]">{conflict.sourceB}</p>
          <p className="mt-0.5 text-[#69736D]">“{conflict.claimB}”</p>
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({ evidence }: { evidence: EvidenceSource[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-[#E5E1D7] pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="size-4 text-[#365FEA]" /> Attached files &amp; notes ({evidence.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-4">
        {evidence.length === 0 ? (
          <p className="text-xs text-[#69736D]">No attachments added yet.</p>
        ) : (
          evidence.map((source) => (
            <details key={source.id} className="rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-3">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#202722]">
                <span>{source.title}</span>
                <Badge tone="neutral">{humanize(source.sourceType)}</Badge>
              </summary>
              <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#69736D]">{source.content}</p>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#365FEA] underline"
                >
                  {source.url} <ExternalLink className="size-3" />
                </a>
              ) : null}
            </details>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function CreateTaskCard({
  sessionId,
  category,
  output,
  productModels,
  onSubmit,
  submitting,
}: {
  sessionId: string;
  category: string;
  output: AnalysisOutput;
  productModels: string[];
  onSubmit: (input: Parameters<typeof api.tasks.create>[0]) => void;
  submitting: boolean;
}) {
  const [criteria, setCriteria] = useState(
    defaultCriteriaFor(category, productModels[0] ?? "task requirements"),
  );
  const [skills, setSkills] = useState(output.suggestedReviewerSkills.join(", "));
  const [reward, setReward] = useState((output.suggestedReward.amountMinor / 100).toFixed(2));
  const [risk, setRisk] = useState<"STANDARD" | "HIGH">("STANDARD");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setSkills(output.suggestedReviewerSkills.join(", "));
    setReward((output.suggestedReward.amountMinor / 100).toFixed(2));
  }, [output]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const amount = parseMoneyToMinor(reward);
    if (!amount || amount < 100) {
      setLocalError("Enter a budget of at least $1.00.");
      return;
    }
    if (criteria.trim().length < 20) {
      setLocalError("Please include at least 20 characters describing what the work should include.");
      return;
    }
    onSubmit({
      sessionId,
      acceptanceCriteria: criteria.trim(),
      requiredSkills: skills
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      rewardMinor: amount,
      rewardApproved: true,
      riskLevel: risk,
      category: normalizeCategoryValue(category),
    });
  }

  return (
    <Card>
      <CardHeader className="border-b border-[#E5E1D7] pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flag className="size-4 text-[#365FEA]" /> Confirm task details
          </CardTitle>
          <RiskBadge risk={risk} />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={submit} className="space-y-3.5" noValidate>
          {localError ? <Alert tone="danger">{localError}</Alert> : null}
          <Field
            label="What should the completed work include?"
            htmlFor="acceptance-criteria"
            hint="One requirement per line."
          >
            <Textarea
              id="acceptance-criteria"
              value={criteria}
              onChange={(event) => setCriteria(event.target.value)}
              rows={5}
              maxLength={4000}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget" htmlFor="reward-amount" hint="USD">
              <Input
                id="reward-amount"
                value={reward}
                onChange={(event) => setReward(event.target.value)}
                inputMode="decimal"
              />
            </Field>
            <Field label="Priority" htmlFor="risk-level">
              <Select
                id="risk-level"
                value={risk}
                onChange={(event) => setRisk(event.target.value as "STANDARD" | "HIGH")}
              >
                <option value="STANDARD">Standard</option>
                <option value="HIGH">High priority</option>
              </Select>
            </Field>
          </div>
          <Field label="Required skills" htmlFor="required-skills" hint="Comma-separated">
            <Input
              id="required-skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="code review, compliance, writing"
            />
          </Field>
          <Button type="submit" size="default" className="w-full" loading={submitting}>
            Find a specialist <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
