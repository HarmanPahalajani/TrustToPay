import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileCheck2,
  FileCode2,
  Flag,
  Gavel,
  HandCoins,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
  Wallet,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  AgentHandbackPayload,
  Submission,
  TaskDetail,
  VerificationRun,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, SectionHeading, DataRow } from "@/components/common";
import { PayPalCheckout } from "@/components/paypal-checkout";
import {
  ModeBadge,
  PaymentStatusBadge,
  PayoutAvailabilityBadge,
  RiskBadge,
  SecurityVerdictBadge,
  StatusBadge,
  VerificationBadge,
} from "@/components/status-badges";
import { TaskTimeline } from "@/components/task-timeline";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { categoryLabel, normalizeCategoryValue } from "@/lib/categories";
import { formatDate, formatMoney, humanize, parseMoneyToMinor } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function TaskDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [handbackPreview, setHandbackPreview] = useState<{
    handback: AgentHandbackPayload;
    signature: { header: string; timestamp: string; algorithm: string };
    idempotentReplay: boolean;
  } | null>(null);

  const query = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.tasks.get(id),
    enabled: Boolean(id),
  });

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["task", id] });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await queryClient.invalidateQueries({ queryKey: ["payments"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const accept = useMutation({
    mutationFn: () => api.tasks.accept(id),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not accept task."),
  });

  const declineOffer = useMutation({
    mutationFn: () => api.tasks.declineOffer(id),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not decline offer."),
  });

  const dispatchOffers = useMutation({
    mutationFn: () => api.tasks.dispatchOffers(id),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not dispatch specialist offers."),
  });

  const fetchHandback = useMutation({
    mutationFn: () => api.tasks.handback(id),
    onSuccess: async (data) => {
      setHandbackPreview(data);
      await invalidate();
      setError(null);
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Could not retrieve verified agent handback."),
  });

  const submit = useMutation({
    mutationFn: (input: Parameters<typeof api.tasks.submit>[1]) => api.tasks.submit(id, input),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Submission failed."),
  });

  const verify = useMutation({
    mutationFn: (input: Parameters<typeof api.tasks.verify>[1]) => api.tasks.verify(id, input),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Verification action failed."),
  });

  const payout = useMutation({
    mutationFn: () => api.payments.payout(id),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Payout failed."),
  });

  const reconcile = useMutation({
    mutationFn: (paymentId: string) => api.payments.reconcile(paymentId),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Reconciliation failed."),
  });

  const retry = useMutation({
    mutationFn: (paymentId: string) => api.payments.retry(paymentId),
    onSuccess: async () => {
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Retry failed."),
  });

  const cancel = useMutation({
    mutationFn: () => api.tasks.cancel(id),
    onSuccess: async () => {
      setCancelOpen(false);
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not cancel task."),
  });

  const updateReward = useMutation({
    mutationFn: (rewardMinor: number) => api.tasks.updateReward(id, rewardMinor),
    onSuccess: async () => {
      setRewardOpen(false);
      await invalidate();
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update reward."),
  });

  if (query.isLoading) return <LoadingBlock label="Loading review task…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "Task not found."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const task = query.data.task;
  const isRequester = task.requester?.id === user?.id;
  const isReviewer = user?.role === "REVIEWER";
  const isAdmin = false;
  const isAssignedReviewer = Boolean(task.assignment?.isMine);
  const isOpenMarket = ["FUNDED", "OFFERED"].includes(task.status) && !task.assignment && isReviewer;
  const latestSubmission = task.submissions?.[0] ?? null;
  const latestVerification = task.verificationRuns?.[0] ?? null;

  const canSubmit =
    isAssignedReviewer &&
    ["REVIEWER_ASSIGNED", "ASSIGNED", "IN_PROGRESS", "VERIFICATION_REJECTED", "NEEDS_REVISION"].includes(
      task.status,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          {
            label: user?.role === "REVIEWER" ? "Marketplace" : "Escalated Tasks",
            to: user?.role === "REVIEWER" ? "/app/marketplace" : "/app/requests",
          },
          { label: task.title },
        ]}
        title={task.title}
        description={task.question}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={task.session ? `/app/sessions/${task.session.id}` : "/app"}>
                <ArrowLeft className="size-4" /> {task.session ? "Agent session" : "Back"}
              </Link>
            </Button>
            {latestVerification ? (
              <Button asChild variant="outline">
                <Link to={`/app/tasks/${task.id}/verification`}>
                  <FileCheck2 className="size-4 text-[#4263EB]" /> Verification report
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <RiskBadge risk={task.riskLevel} />
        <Badge tone="neutral">{categoryLabel(task.category)}</Badge>
        {task.fundedAt ? (
          <Badge tone="success" dot>
            Payment ready
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="min-w-0 space-y-6">
          {/* Task Requirements & Supplied Evidence */}
          <Card>
            <CardHeader className="border-b border-[#E4E9F2] pb-3.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="size-4 text-[#4263EB]" /> Task details &amp; requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {task.question ? (
                <div>
                  <p className="text-xs font-semibold text-[#68738A]">
                    What the AI agent needed help with
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#141B2D]">{task.question}</p>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-semibold text-[#68738A]">
                  Acceptance criteria
                </p>
                <div className="mt-1.5 rounded-xl bg-[#F5F7FC] p-3.5 whitespace-pre-line text-xs leading-6 text-[#141B2D]">
                  {task.acceptanceCriteria}
                </div>
              </div>

              {task.requiredSkills && task.requiredSkills.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-[#68738A]">
                    Required specialist skills
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {task.requiredSkills.map((skill) => (
                      <Badge key={skill} tone="indigo">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {task.evidence && task.evidence.length > 0 ? (
                <div className="space-y-2 border-t border-[#E4E9F2] pt-4">
                  <SectionHeading
                    title="Supplied evidence"
                    description="Specialists and automated verifiers inspect deliverables against these sources."
                  />
                  <div className="space-y-2">
                    {task.evidence.map((item) => (
                      <details
                        key={item.id}
                        className="rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-3"
                      >
                        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#141B2D]">
                          <span>{item.title}</span>
                          <Badge tone="neutral">{humanize(item.sourceType)}</Badge>
                        </summary>
                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#4E596E]">
                          {item.content}
                        </p>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#4263EB] underline underline-offset-2"
                          >
                            {item.url} <ExternalLink className="size-3" />
                          </a>
                        ) : null}
                      </details>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Hybrid Matching & Top-5 Specialist Offers */}
          {(isRequester && (Boolean(task.fundedAt) || (task.offers && task.offers.length > 0))) ? (
            <MatchingProgressCard
              task={task}
              onDispatchOffers={() => dispatchOffers.mutate()}
              dispatching={dispatchOffers.isPending}
            />
          ) : null}

          {/* Submission or Form */}
          {latestSubmission ? (
            <SubmissionCard
              submission={latestSubmission}
              verification={latestVerification}
              canSubmit={canSubmit}
              onSubmit={(input) => submit.mutate(input)}
              submitting={submit.isPending}
              task={task}
            />
          ) : canSubmit ? (
            <SubmissionForm
              task={task}
              onSubmit={(input) => submit.mutate(input)}
              submitting={submit.isPending}
              title="Submit your evidenced answer & code artifact"
            />
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardCheck className="size-4 text-[#4263EB]" /> Deliverable status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-5 text-[#68738A]">
                  {isAssignedReviewer
                    ? "Your deliverable and independent verification record will appear here once submitted."
                    : isOpenMarket
                      ? "Accept this task in the action panel to claim ownership and submit an artifact."
                      : "No submission has been recorded yet. An eligible specialist must claim and submit an artifact."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Verification Certificate & Checks */}
          {latestVerification ? (
            <VerificationCard
              verification={latestVerification}
              isAdmin={isAdmin}
              taskStatus={task.status}
              onVerify={(input) => verify.mutate(input)}
              verifying={verify.isPending}
            />
          ) : null}

          {/* Signed Agent Handback Certificate */}
          {handbackPreview ? (
            <Card className="border-[#12A875]/40">
              <CardHeader className="border-b border-[#E4E9F2] bg-[#12A875]/[0.05] pb-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KeyRound className="size-4 text-[#12A875]" /> Verified Results Certificate &amp; Signed Handback
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="success" dot>
                      {handbackPreview.signature.algorithm}
                    </Badge>
                    {handbackPreview.idempotentReplay ? (
                      <Badge tone="neutral">Idempotent Replay</Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="grid gap-2.5 rounded-xl bg-[#F5F7FC] p-4">
                  <div>
                    <span className="font-semibold text-[#68738A]">
                      File v{handbackPreview.handback.artifact.version} integrity (SHA-256):{" "}
                    </span>
                    <span className="break-all font-mono text-[11px] text-[#141B2D]">
                      {handbackPreview.handback.artifact.sha256Digest}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#68738A]">Secure digital signature: </span>
                    <span className="break-all font-mono text-[11px] text-[#141B2D]">
                      {handbackPreview.signature.header}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#68738A]">Result reference key: </span>
                    <span className="break-all font-mono text-[11px] text-[#141B2D]">
                      {handbackPreview.handback.handoffIdempotencyKey}
                    </span>
                  </div>
                </div>

                <details className="rounded-xl bg-[#10172A] p-4 text-[#E2E8F0]">
                  <summary className="cursor-pointer font-mono text-xs font-semibold text-[#20BCE5]">
                    Inspect JSON Agent Result Payload
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto font-mono text-[11px] leading-5">
                    {JSON.stringify(handbackPreview.handback, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : null}

          {/* Workflow Timeline */}
          <Card>
            <CardHeader className="border-b border-[#E4E9F2] pb-3">
              <CardTitle className="text-sm">Task activity history</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <TaskTimeline events={task.events ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Action & Ledger Column */}
        <aside className="min-w-0 space-y-5">
          <ActionCard
            task={task}
            userRole={user?.role}
            isAdmin={isAdmin}
            isRequester={isRequester}
            isAssignedReviewer={isAssignedReviewer}
            isOpenMarket={isOpenMarket}
            onFunded={invalidate}
            onAccept={() => accept.mutate()}
            accepting={accept.isPending}
            onDeclineOffer={() => declineOffer.mutate()}
            decliningOffer={declineOffer.isPending}
            onDispatchOffers={() => dispatchOffers.mutate()}
            dispatchingOffers={dispatchOffers.isPending}
            onFetchHandback={() => fetchHandback.mutate()}
            fetchingHandback={fetchHandback.isPending}
            onPayout={() => payout.mutate()}
            paying={payout.isPending}
            onReconcile={(paymentId) => reconcile.mutate(paymentId)}
            reconciling={reconcile.isPending}
            onRetry={(paymentId) => retry.mutate(paymentId)}
            retrying={retry.isPending}
            onOpenDispute={() => setDisputeOpen(true)}
            onOpenCancel={() => setCancelOpen(true)}
            onEditReward={() => setRewardOpen(true)}
            onResume={async () => {
              if (!task.session) return;
              try {
                await api.sessions.resume(task.session.id);
                await invalidate();
                navigate(`/app/sessions/${task.session.id}`);
              } catch (err) {
                setError(err instanceof ApiError ? err.message : "Could not resume the session.");
              }
            }}
          />

          <PaymentsCard
            task={task}
            isAdmin={isAdmin}
            isRequester={isRequester}
            onReconcile={(paymentId) => reconcile.mutate(paymentId)}
            reconciling={reconcile.isPending}
            onRetry={(paymentId) => retry.mutate(paymentId)}
            retrying={retry.isPending}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Task details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DataRow label="Category">{categoryLabel(task.category)}</DataRow>
                <DataRow label="Reward">{formatMoney(task.rewardMinor, task.currency)}</DataRow>
                <DataRow label="Reward status">
                  {task.reward ? <Badge tone="neutral">{humanize(task.reward.status)}</Badge> : "—"}
                </DataRow>
                <DataRow label="Payout status">
                  <PayoutAvailabilityBadge availability={task.payoutAvailability} />
                </DataRow>
                <DataRow label="Created">{formatDate(task.createdAt)}</DataRow>
                <DataRow label="Funded">{task.fundedAt ? formatDate(task.fundedAt) : "Not yet"}</DataRow>
                <DataRow label="Verified">{task.verifiedAt ? formatDate(task.verifiedAt) : "Not yet"}</DataRow>
                <DataRow label="Handed off">{task.handedOffAt ? formatDate(task.handedOffAt) : "Not yet"}</DataRow>
                <DataRow label="Completed">{task.completedAt ? formatDate(task.completedAt) : "Not yet"}</DataRow>
                <DataRow label="Task ID" mono>
                  {task.id}
                </DataRow>
              </dl>
            </CardContent>
          </Card>

          {task.reviewerPayout ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HandCoins className="size-4 text-[#4263EB]" /> Specialist payout profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {task.reviewerPayout.consent && task.reviewerPayout.email ? (
                  <div className="flex items-start gap-2 rounded-lg bg-[#12A875]/[0.08] p-3 text-[#141B2D]">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0B7D56]">Payout consent recorded</p>
                      <p className="mt-0.5 truncate text-xs text-[#141B2D]">
                        {task.reviewerPayout.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Alert tone="warning">
                    Payout details incomplete. The specialist must add a PayPal email and confirm payout consent.
                  </Alert>
                )}
                <p className="text-xs text-[#68738A]">Provider: {task.reviewerPayout.provider}</p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>

      <DisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        onSubmit={(reason) => {
          api.tasks
            .dispute(id, reason)
            .then(async () => {
              setDisputeOpen(false);
              await invalidate();
            })
            .catch((err) => setError(err instanceof ApiError ? err.message : "Could not open a dispute."));
        }}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this review task?</DialogTitle>
            <DialogDescription>
              The task will be marked cancelled and the reward will no longer be payable. Captured funding is not
              automatically refunded by this application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep task
            </Button>
            <Button variant="destructive" onClick={() => cancel.mutate()} loading={cancel.isPending}>
              Cancel task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RewardDialog
        open={rewardOpen}
        onOpenChange={setRewardOpen}
        currentMinor={task.rewardMinor}
        onSubmit={(rewardMinor) => updateReward.mutate(rewardMinor)}
        loading={updateReward.isPending}
      />
    </div>
  );
}

function MatchingProgressCard({
  task,
  onDispatchOffers,
  dispatching,
}: {
  task: TaskDetail;
  onDispatchOffers: () => void;
  dispatching: boolean;
}) {
  const offers = task.offers ?? [];
  const funded = Boolean(task.fundedAt);
  const matched = offers.length > 0;
  const assigned = Boolean(task.assignment);

  const steps = [
    { label: "Jina Embeddings", done: funded },
    { label: "Elastic Hybrid Search", done: funded },
    { label: "PostgreSQL Eligibility", done: matched || assigned },
    { label: "Top-5 Offer Dispatch", done: matched || assigned },
  ];

  return (
    <Card>
      <CardHeader className="border-b border-[#E4E9F2] pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="size-4 text-[#4263EB]" /> Hybrid Specialist Routing &amp; Top-5 Offers
          </CardTitle>
          {["FUNDED", "OFFERED"].includes(task.status) && !assigned ? (
            <Button size="sm" variant="outline" onClick={onDispatchOffers} loading={dispatching}>
              <Sparkles className="size-3.5 text-[#4263EB]" /> Re-dispatch Offers
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.label}
              className={cn(
                "rounded-lg border p-2.5 text-xs",
                step.done
                  ? "border-[#12A875]/35 bg-[#12A875]/[0.06] text-[#141B2D]"
                  : "border-[#E4E9F2] bg-[#F5F7FC] text-[#68738A]",
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className={cn("size-3.5 shrink-0", step.done ? "text-[#12A875]" : "text-[#94A3B8]")} />
                <span className="truncate">{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        {offers.length === 0 ? (
          <p className="text-xs text-[#68738A]">
            No specialist offers sent yet. Send invites after funding to notify the top 5 matches.
          </p>
        ) : (
          <div className="divide-y divide-[#E4E9F2]">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Badge tone="neutral">Rank #{offer.rank}</Badge>
                  <span className="truncate font-semibold text-[#141B2D]">
                    {offer.specialist?.name ?? `Specialist ${offer.specialistId.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#4E596E] tabular-nums">{offer.score} pts</span>
                  <Badge
                    tone={
                      offer.status === "ACCEPTED"
                        ? "success"
                        : offer.status === "PENDING"
                          ? "cobalt"
                          : "neutral"
                    }
                    dot
                  >
                    {humanize(offer.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionCard({
  task,
  userRole,
  isAdmin,
  isRequester,
  isAssignedReviewer,
  isOpenMarket,
  onFunded,
  onAccept,
  accepting,
  onDeclineOffer,
  decliningOffer,
  onDispatchOffers,
  dispatchingOffers,
  onFetchHandback,
  fetchingHandback,
  onPayout,
  paying,
  onReconcile,
  reconciling,
  onRetry,
  retrying,
  onOpenDispute,
  onOpenCancel,
  onEditReward,
  onResume,
}: {
  task: TaskDetail;
  userRole: string | undefined;
  isAdmin: boolean;
  isRequester: boolean;
  isAssignedReviewer: boolean;
  isOpenMarket: boolean;
  onFunded: () => Promise<void>;
  onAccept: () => void;
  accepting: boolean;
  onDeclineOffer: () => void;
  decliningOffer: boolean;
  onDispatchOffers: () => void;
  dispatchingOffers: boolean;
  onFetchHandback: () => void;
  fetchingHandback: boolean;
  onPayout: () => void;
  paying: boolean;
  onReconcile: (paymentId: string) => void;
  reconciling: boolean;
  onRetry: (paymentId: string) => void;
  retrying: boolean;
  onOpenDispute: () => void;
  onOpenCancel: () => void;
  onEditReward: () => void;
  onResume: () => void;
}) {
  const payable =
    (isRequester || isAdmin) &&
    ["VERIFIED", "PAYMENT_READY", "PAYOUT_FAILED"].includes(task.status);
  const processingPayout = task.payments?.find(
    (p) => p.type === "PAYOUT" && p.status === "PROCESSING",
  );
  const failedFunding = task.payments?.find((p) => p.type === "FUNDING" && p.status === "FAILED");
  const resumeAllowed =
    (isRequester || isAdmin) &&
    ["VERIFIED", "PAYMENT_READY", "PAYMENT_PAID", "PAYOUT_FAILED", "HANDED_OFF"].includes(task.status);
  const handbackAllowed =
    (isRequester || isAdmin) &&
    [
      "VERIFIED",
      "PAYMENT_READY",
      "PAYMENT_PROCESSING",
      "PAYMENT_PAID",
      "PAYOUT_FAILED",
      "HANDED_OFF",
      "ORIGINAL_TASK_RESUMED",
      "COMPLETED",
    ].includes(task.status);
  const canDispute =
    (isRequester || isAssignedReviewer || isAdmin) &&
    !["COMPLETED", "CANCELLED", "DISPUTED", "PAYMENT_PAID", "EXPIRED"].includes(task.status);
  const pendingMyOffer = task.myOffer?.status === "PENDING" ? task.myOffer : null;

  return (
    <Card className="border-[#4263EB]/25">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flag className="size-4 text-[#4263EB]" /> Next action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {["AWAITING_FUNDING", "FUNDING_FAILED"].includes(task.status) && (isRequester || isAdmin) ? (
          <>
            <p className="text-xs leading-5 text-[#68738A]">
              Fund the escrow reward to make this task available to specialists.
            </p>
            {task.status === "FUNDING_FAILED" ? (
              <Alert tone="warning">
                Previous funding attempt failed. Reconcile or capture a new funding order below.
              </Alert>
            ) : null}
            <PayPalCheckout
              taskId={task.id}
              amountDisplay={formatMoney(task.rewardMinor, task.currency)}
              currency={task.currency}
              onCompleted={onFunded}
              label={`Fund ${formatMoney(task.rewardMinor, task.currency)}`}
            />
            <Button variant="outline" size="sm" className="w-full" onClick={onEditReward}>
              <CircleDollarSign className="size-3.5" /> Change reward before funding
            </Button>
          </>
        ) : null}

        {["FUNDED", "OFFERED"].includes(task.status) && (isRequester || isAdmin) && !task.assignment ? (
          <div className="space-y-2 rounded-xl bg-[#F5F7FC] p-3.5 text-xs">
            <p className="font-semibold text-[#141B2D]">Notify matched specialists</p>
            <p className="text-[#68738A]">
              {task.offers && task.offers.length > 0
                ? `${task.offers.filter((o) => o.status === "PENDING").length} specialist invite(s) waiting for a response.`
                : "Invite up to 5 top-matched verified specialists to claim this task."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onDispatchOffers}
              loading={dispatchingOffers}
            >
              <Sparkles className="size-3.5 text-[#4263EB]" /> Send specialist invites
            </Button>
          </div>
        ) : null}

        {isOpenMarket ? (
          <>
            {pendingMyOffer ? (
              <div className="space-y-1.5 rounded-xl bg-[#4263EB]/[0.07] p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#2E4CCB] tabular-nums">
                    Direct offer #{pendingMyOffer.rank} ({pendingMyOffer.score} pts)
                  </span>
                  <Badge tone="indigo">Batch #{pendingMyOffer.batchNumber}</Badge>
                </div>
                <p className="text-xs text-[#4E596E] tabular-nums">
                  Expires {formatDate(pendingMyOffer.expiresAt)}. Accept to start working on this task.
                </p>
              </div>
            ) : (
              <p className="text-xs leading-5 text-[#68738A]">
                This funded task is open in the marketplace. Claim it to begin work.
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={onAccept} loading={accepting}>
                <ClipboardCheck className="size-3.5" /> Accept task
              </Button>
              {pendingMyOffer ? (
                <Button size="sm" variant="outline" onClick={onDeclineOffer} loading={decliningOffer}>
                  Decline
                </Button>
              ) : null}
            </div>
          </>
        ) : null}

        {isAssignedReviewer && ["REVIEWER_ASSIGNED", "ASSIGNED", "IN_PROGRESS"].includes(task.status) ? (
          <p className="text-xs leading-5 text-[#68738A]">
            You claimed this task. Submit your work and notes in the submission panel.
          </p>
        ) : null}

        {task.status === "VERIFICATION_PENDING" ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#F5F7FC] p-3 text-xs font-medium text-[#141B2D]">
            <Loader2 className="size-4 animate-spin text-[#4263EB]" /> Security and quality checks running…
          </div>
        ) : null}

        {payable ? (
          <>
            <div className="rounded-xl bg-[#12A875]/[0.08] p-3.5 text-xs leading-5 text-[#141B2D]">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="font-semibold text-[#0B7D56]">Verified and ready for payout</p>
                <PayoutAvailabilityBadge availability={task.payoutAvailability} />
              </div>
              <p className="mt-1 text-[#4E596E] tabular-nums">
                Release {formatMoney(task.rewardMinor, task.currency)} to{" "}
                {task.assignment?.reviewer.name ?? "the specialist"}.{" "}
                {task.payoutAvailability === "DEMO_SIMULATED"
                  ? "Recorded as a simulated payout in practice mode."
                  : task.payoutAvailability === "PAYOUT_UNAVAILABLE"
                    ? "Automated specialist payouts are currently unavailable for this merchant account."
                    : "Sent via PayPal test mode."}
              </p>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={onPayout}
              loading={paying}
              disabled={task.payoutAvailability === "PAYOUT_UNAVAILABLE"}
            >
              <Wallet className="size-3.5" />
              {task.payoutAvailability === "PAYOUT_UNAVAILABLE"
                ? "Payout unavailable right now"
                : task.payoutAvailability === "DEMO_SIMULATED"
                  ? "Record Simulated Payout"
                  : "Release Specialist Payout"}
            </Button>

            {!task.reviewerPayout?.consent || !task.reviewerPayout.email ? (
              <Alert tone="warning">The specialist needs to add a PayPal email and payout consent in their profile.</Alert>
            ) : null}
          </>
        ) : null}

        {task.status === "PAYMENT_PROCESSING" && processingPayout ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onReconcile(processingPayout.id)}
            loading={reconciling}
          >
            <RefreshCw className="size-3.5" /> Refresh payout status
          </Button>
        ) : null}

        {task.status === "PAYMENT_PAID" ? (
          <div className="rounded-xl bg-[#12A875]/[0.08] p-3.5 text-xs">
            <p className="font-semibold text-[#0B7D56]">Specialist paid</p>
            <p className="mt-0.5 text-[#4E596E]">The verified result is ready to return to your agent.</p>
          </div>
        ) : null}

        {handbackAllowed ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onFetchHandback}
            loading={fetchingHandback}
          >
            <ShieldCheck className="size-3.5 text-[#12A875]" /> Preview signed agent result
          </Button>
        ) : null}

        {resumeAllowed && task.session ? (
          <Button size="sm" className="w-full" onClick={onResume}>
            <CheckCircle2 className="size-3.5" /> Resume AI session
          </Button>
        ) : null}

        {task.status === "PAYOUT_FAILED" && failedFunding ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onRetry(failedFunding.id)}
            loading={retrying}
          >
            Retry
          </Button>
        ) : null}

        {userRole === "REQUESTER" &&
        ["AWAITING_FUNDING", "FUNDING_FAILED", "FUNDED", "OFFERED"].includes(task.status) ? (
          <Button variant="ghost" size="sm" className="w-full text-[#E5484D] hover:bg-[#E5484D]/10" onClick={onOpenCancel}>
            Cancel task
          </Button>
        ) : null}

        {canDispute ? (
          <Button variant="ghost" size="sm" className="w-full" onClick={onOpenDispute}>
            <Gavel className="size-3.5" /> Open dispute
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PaymentsCard({
  task,
  isAdmin,
  isRequester,
  onReconcile,
  reconciling,
  onRetry,
  retrying,
}: {
  task: TaskDetail;
  isAdmin: boolean;
  isRequester: boolean;
  onReconcile: (id: string) => void;
  reconciling: boolean;
  onRetry: (id: string) => void;
  retrying: boolean;
}) {
  const visible = task.payments ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Banknote className="size-4 text-[#4263EB]" /> Payment history
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-[#E4E9F2] pt-1">
        {visible.length === 0 ? (
          <p className="py-2 text-xs text-[#68738A]">No payment transactions yet.</p>
        ) : (
          visible.map((payment) => (
            <div key={payment.id} className="py-3 first:pt-1 last:pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#141B2D]">
                    {payment.type === "FUNDING" ? "Task funding" : "Specialist payout"}
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                  <ModeBadge mode={payment.mode} />
                </div>
                <span className="text-sm font-bold text-[#141B2D] tabular-nums">
                  {payment.amountDisplay}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#68738A] tabular-nums">
                {payment.provider} · {formatDate(payment.createdAt)}
              </p>
              {payment.orderId ? (
                <p className="mt-0.5 truncate font-mono text-[11px] text-[#68738A]">Order: {payment.orderId}</p>
              ) : null}
              {payment.payoutBatchId ? (
                <p className="mt-0.5 truncate font-mono text-[11px] text-[#68738A]">Batch: {payment.payoutBatchId}</p>
              ) : null}
              {payment.failureMessage ? (
                <p className="mt-1 text-xs font-medium text-[#E5484D]">{payment.failureMessage}</p>
              ) : null}
              {(isAdmin || isRequester) && ["FAILED", "PROCESSING", "PENDING"].includes(payment.status) ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReconcile(payment.id)}
                    loading={reconciling}
                  >
                    <RefreshCw className="size-3.5" /> Refresh status
                  </Button>
                  {isAdmin && payment.status === "FAILED" ? (
                    <Button variant="ghost" size="sm" onClick={() => onRetry(payment.id)} loading={retrying}>
                      Retry
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function VerificationCard({
  verification,
  isAdmin,
  taskStatus,
  onVerify,
  verifying,
}: {
  verification: VerificationRun;
  isAdmin: boolean;
  taskStatus: string;
  onVerify: (input: { decision?: "PASS" | "REJECT"; note?: string }) => void;
  verifying: boolean;
}) {
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"PASS" | "REJECT">("PASS");

  return (
    <Card className={verification.status === "PASSED" ? "border-[#12A875]/35" : undefined}>
      <CardHeader className="border-b border-[#E4E9F2] pb-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="size-4 text-[#12A875]" /> Work verification report
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <VerificationBadge status={verification.status} />
            {verification.securityVerdict ? (
              <SecurityVerdictBadge verdict={verification.securityVerdict} />
            ) : null}
            {verification.artifactVersion ? (
              <Badge tone="neutral">Submission v{verification.artifactVersion}</Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-sm leading-6 text-[#141B2D]">{verification.decisionReason}</p>

        {verification.artifactSha256 ? (
          <div className="rounded-xl bg-[#F5F7FC] p-3.5 text-xs">
            <span className="font-semibold text-[#68738A]">File integrity check (SHA-256): </span>
            <span className="break-all font-mono text-[11px] text-[#141B2D]">{verification.artifactSha256}</span>
          </div>
        ) : null}

        {verification.securityReview ? (
          <div className="space-y-2 rounded-xl bg-[#F5F7FC] p-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-semibold text-[#141B2D]">
                <ShieldCheck className="size-4 text-[#4263EB]" /> Security checks
              </p>
              <SecurityVerdictBadge verdict={verification.securityReview.verdict} />
            </div>
            <p className="leading-5 text-[#4E596E]">{verification.securityReview.summary}</p>
            {verification.securityReview.gemini ? (
              <p className="text-xs text-[#68738A] tabular-nums">
                AI review ({verification.securityReview.gemini.model}) · Confidence:{" "}
                {Math.round(verification.securityReview.gemini.confidence * 100)}%
              </p>
            ) : null}
          </div>
        ) : null}

        {verification.executionSummary ? (
          <div className="space-y-2 rounded-xl bg-[#F5F7FC] p-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-semibold text-[#141B2D]">
                <Terminal className="size-4 text-[#4263EB]" /> Work execution summary
              </p>
              <div className="flex items-center gap-1.5">
                <Badge tone={verification.executionSummary.passed ? "success" : "danger"} dot>
                  {verification.executionSummary.verdict}
                </Badge>
                <Badge tone="neutral">{verification.executionSummary.mode}</Badge>
              </div>
            </div>
            <p className="leading-5 text-[#4E596E]">{verification.executionSummary.summary}</p>
            {verification.executionSummary.stdout ? (
              <pre className="max-h-36 overflow-auto rounded-lg bg-[#10172A] p-3 font-mono text-[11px] text-[#E2E8F0]">
                {verification.executionSummary.stdout}
              </pre>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-[#68738A]">
              Passed checks ({verification.checksPassed.length})
            </p>
            <div className="space-y-2">
              {verification.checksPassed.map((check) => (
                <div
                  key={check.id}
                  className="flex gap-2 rounded-lg bg-[#12A875]/[0.07] p-3"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                  <div>
                    <p className="text-xs font-semibold text-[#141B2D]">{check.label}</p>
                    <p className="mt-0.5 text-xs leading-4 text-[#4E596E]">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#68738A]">
              Failed checks ({verification.checksFailed.length})
            </p>
            {verification.checksFailed.length === 0 ? (
              <p className="rounded-lg bg-[#F5F7FC] p-3 text-xs text-[#68738A]">
                No failed checks.
              </p>
            ) : (
              <div className="space-y-2">
                {verification.checksFailed.map((check) => (
                  <div
                    key={check.id}
                    className={cn(
                      "flex gap-2 rounded-lg p-3",
                      check.severity === "HARD"
                        ? "bg-[#E5484D]/[0.07]"
                        : "bg-[#F5A623]/[0.1]",
                    )}
                  >
                    <ShieldAlert
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        check.severity === "HARD" ? "text-[#E5484D]" : "text-[#D48806]",
                      )}
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#141B2D]">{check.label}</p>
                      <p className="mt-0.5 text-xs leading-4 text-[#4E596E]">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {verification.evidenceReferences.length > 0 ? (
          <div className="border-t border-[#E4E9F2] pt-3">
            <p className="mb-2 text-xs font-semibold text-[#68738A]">
              Evidence references
            </p>
            <div className="divide-y divide-[#E4E9F2]">
              {verification.evidenceReferences.map((reference, index) => (
                <div key={`${reference.label}-${index}`} className="py-2.5 text-xs first:pt-0 last:pb-0">
                  <p className="font-semibold text-[#141B2D]">{reference.label}</p>
                  {reference.url ? (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#4263EB] underline underline-offset-2"
                    >
                      {reference.url} <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                  {reference.quote ? (
                    <p className="mt-1 text-xs italic text-[#4E596E]">“{reference.quote}”</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {isAdmin && taskStatus === "NEEDS_MANUAL_REVIEW" ? (
          <div className="rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/[0.08] p-4">
            <p className="text-xs font-bold text-[#9A6100]">Manual verification decision</p>
            <div className="mt-2 space-y-2">
              <Field label="Decision note" htmlFor="admin-verification-note">
                <Textarea
                  id="admin-verification-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => onVerify({ decision, note })}
                  loading={verifying}
                  disabled={note.trim().length < 10}
                >
                  {decision === "PASS" ? "Approve submission" : "Reject submission"}
                </Button>
                <select
                  value={decision}
                  onChange={(event) => setDecision(event.target.value as "PASS" | "REJECT")}
                  className="h-8 rounded-md border border-[#E4E9F2] bg-[#FFFFFF] px-2 text-xs text-[#141B2D]"
                >
                  <option value="PASS">PASS</option>
                  <option value="REJECT">REJECT</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubmissionCard({
  submission,
  verification,
  canSubmit,
  onSubmit,
  submitting,
  task,
}: {
  submission: Submission;
  verification: VerificationRun | null;
  canSubmit: boolean;
  onSubmit: (input: Parameters<typeof api.tasks.submit>[1]) => void;
  submitting: boolean;
  task: TaskDetail;
}) {
  const artifact = submission.artifact ?? task.artifacts?.[0] ?? null;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b border-[#E4E9F2] pb-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode2 className="size-4 text-[#4263EB]" /> Specialist deliverable{" "}
              {submission.version ? `v${submission.version}` : ""}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              {verification ? <VerificationBadge status={verification.status} /> : null}
              {artifact ? <Badge tone="cobalt">Artifact v{artifact.version}</Badge> : null}
              <Badge tone="neutral">{submission.confidenceScore}% confidence</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {artifact ? (
            <div className="space-y-2.5 rounded-xl bg-[#F5F7FC] p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-semibold text-[#141B2D]">
                  <Database className="size-3.5 text-[#4263EB]" /> Submitted files (v{artifact.version})
                </p>
                <span className="text-xs text-[#68738A] tabular-nums">
                  {artifact.fileCount} file{artifact.fileCount === 1 ? "" : "s"} · {artifact.totalSizeBytes} bytes
                </span>
              </div>
              <p className="break-all font-mono text-[11px] text-[#4E596E]">
                Integrity check (SHA-256): {artifact.sha256Digest}
              </p>

              {artifact.files && artifact.files.length > 0 ? (
                <div className="divide-y divide-[#E4E9F2] pt-1">
                  {artifact.files.map((file) => (
                    <details key={file.path} className="py-2 first:pt-1 last:pb-0">
                      <summary className="flex cursor-pointer items-center justify-between gap-2 font-mono text-xs font-semibold text-[#141B2D]">
                        <span>{file.path}</span>
                        <span className="font-sans text-[11px] font-normal text-[#68738A] tabular-nums">
                          {file.sizeBytes} B
                        </span>
                      </summary>
                      <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-[#10172A] p-3 font-mono text-[11px] text-[#E2E8F0]">
                        {file.content}
                      </pre>
                    </details>
                  ))}
                </div>
              ) : null}

              {artifact.patchText ? (
                <details className="border-t border-[#E4E9F2] pt-2">
                  <summary className="cursor-pointer font-mono text-xs font-semibold text-[#141B2D]">
                    Unified Git Diff Patch
                  </summary>
                  <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-[#10172A] p-3 font-mono text-[11px] text-[#E2E8F0]">
                    {artifact.patchText}
                  </pre>
                </details>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold text-[#68738A]">Submitted answer</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#141B2D]">{submission.answer}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#68738A]">Explanation</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-6 text-[#4E596E]">{submission.explanation}</p>
          </div>

          {submission.sourceUrl ? (
            <a
              href={submission.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#4263EB] underline underline-offset-2"
            >
              {submission.sourceUrl} <ExternalLink className="size-3" />
            </a>
          ) : null}

          {submission.evidenceNotes ? (
            <div className="rounded-xl bg-[#F5F7FC] p-3.5">
              <p className="text-xs font-semibold text-[#68738A]">Evidence notes</p>
              <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#141B2D]">{submission.evidenceNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canSubmit ? (
        <SubmissionForm
          task={task}
          onSubmit={onSubmit}
          submitting={submitting}
          title="Submit revised deliverable (new artifact version)"
          initial={submission}
        />
      ) : null}
    </div>
  );
}

function sampleAnswerFor(task: TaskDetail) {
  const criteria = task.acceptanceCriteria.replace(/\n/g, "; ");
  const category = normalizeCategoryValue(task.category);

  if (category === "PROGRAMMING") {
    return {
      answer:
        "The root cause is an unbounded await fetch inside each worker combined with a pool size of 4 workers, so the queue stops draining after four jobs. Adding an AbortController timeout ensures workers release cleanly.",
      explanation:
        "Comparing worker-pool.ts against the deployment runbook reveals a configuration mismatch (4 vs 12 workers) and a missing fetch timeout on Node 20.11. Aborting stalled outbound calls via AbortController preserves retry semantics. Covers criteria: " +
        criteria,
      confidenceScore: 89,
      sourceUrl: "https://nodejs.org/api/globals.html",
      evidenceNotes:
        'Independent source excerpt: "The AbortController interface represents a controller object that allows you to abort one or more web requests as and when desired."',
      filePath: "src/worker-pool.ts",
      fileContent:
        "export async function fetchWithTimeout(url: string, timeoutMs = 30_000): Promise<Response> {\n  const controller = new AbortController();\n  const timer = setTimeout(() => controller.abort(), timeoutMs);\n  try {\n    return await fetch(url, { signal: controller.signal });\n  } finally {\n    clearTimeout(timer);\n  }\n}\n",
      patchText:
        "--- a/src/worker-pool.ts\n+++ b/src/worker-pool.ts\n@@ -12,3 +12,6 @@\n-  const response = await fetch(job.endpoint);\n+  const controller = new AbortController();\n+  const timer = setTimeout(() => controller.abort(), 30_000);\n+  const response = await fetch(job.endpoint, { signal: controller.signal }).finally(() => clearTimeout(timer));\n",
    };
  }

  return {
    answer:
      "The configuration cannot safely sustain the target load under the documented passthrough limits. Binding verification checks to the documented hardware ceiling prevents silent degradation.",
    explanation:
      "Separated nominal input capacity from continuous host limit across both attached specifications. This directly satisfies the acceptance criteria: " +
      criteria,
    confidenceScore: 88,
    sourceUrl: "https://www.usb.org/usb-charger",
    evidenceNotes:
      'Quoted specification excerpt: "USB Power Delivery negotiates voltage and current up to the cable and port limits."',
    filePath: "",
    fileContent: "",
    patchText: "",
  };
}

function SubmissionForm({
  task,
  onSubmit,
  submitting,
  title,
  initial,
}: {
  task: TaskDetail;
  onSubmit: (input: Parameters<typeof api.tasks.submit>[1]) => void;
  submitting: boolean;
  title: string;
  initial?: Submission;
}) {
  const sample = useMemo(() => sampleAnswerFor(task), [task]);
  const initialFile = initial?.artifact?.files?.[0];
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [confidence, setConfidence] = useState(initial?.confidenceScore ?? 85);
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [evidenceNotes, setEvidenceNotes] = useState(initial?.evidenceNotes ?? "");
  const [filePath, setFilePath] = useState(initialFile?.path ?? "");
  const [fileContent, setFileContent] = useState(initialFile?.content ?? "");
  const [patchText, setPatchText] = useState(initial?.artifact?.patchText ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const hasCodeFile = Boolean(filePath.trim() && fileContent.trim());
    const hasPatch = Boolean(patchText.trim());
    if (!hasCodeFile && !hasPatch && answer.trim().length < 20) {
      setLocalError(
        "The answer must be at least 20 characters when no code files or unified diff patch are attached.",
      );
      return;
    }
    if (explanation.trim().length < 20) {
      setLocalError("The technical explanation must be at least 20 characters.");
      return;
    }
    onSubmit({
      answer: answer.trim() || fileContent.trim() || patchText.trim(),
      explanation: explanation.trim(),
      confidenceScore: confidence,
      sourceUrl: sourceUrl.trim() || undefined,
      evidenceNotes: evidenceNotes.trim() || undefined,
      files: hasCodeFile ? [{ path: filePath.trim(), content: fileContent }] : undefined,
      patchText: hasPatch ? patchText : undefined,
    });
  }

  return (
    <Card>
      <CardHeader className="border-b border-[#E4E9F2] pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4 text-[#4263EB]" /> {title}
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswer(sample.answer);
              setExplanation(sample.explanation);
              setConfidence(sample.confidenceScore);
              setSourceUrl(sample.sourceUrl);
              setEvidenceNotes(sample.evidenceNotes);
              if (sample.filePath) setFilePath(sample.filePath);
              if (sample.fileContent) setFileContent(sample.fileContent);
              if (sample.patchText) setPatchText(sample.patchText);
              setLocalError(null);
            }}
          >
            <Sparkles className="size-3.5 text-[#4263EB]" /> Load demo artifact
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={submit} className="space-y-4" noValidate>
          {localError ? <Alert tone="danger">{localError}</Alert> : null}

          <Field
            label="Resolution summary"
            htmlFor="submission-answer"
            required
            hint="Direct resolution answering all acceptance criteria."
          >
            <Textarea
              id="submission-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={4}
              maxLength={6000}
            />
          </Field>

          <Field
            label="Technical explanation"
            htmlFor="submission-explanation"
            required
            hint="Document trade-offs, version constraints, and verification steps."
          >
            <Textarea
              id="submission-explanation"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={4}
              maxLength={6000}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Confidence (%)" htmlFor="submission-confidence">
              <Input
                id="submission-confidence"
                type="number"
                min={1}
                max={100}
                value={confidence}
                onChange={(event) => setConfidence(Number(event.target.value) || 80)}
              />
            </Field>
            <Field label="Reference documentation URL" htmlFor="submission-url">
              <Input
                id="submission-url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>

          <Field label="Evidence quote & verification notes" htmlFor="submission-notes">
            <Textarea
              id="submission-notes"
              value={evidenceNotes}
              onChange={(event) => setEvidenceNotes(event.target.value)}
              rows={2}
            />
          </Field>

          <div className="space-y-3 rounded-xl bg-[#F5F7FC] p-4">
            <p className="text-xs font-semibold text-[#141B2D]">
              Optional file or code patch
            </p>
            <Field label="Target file path" htmlFor="submission-file-path">
              <Input
                id="submission-file-path"
                value={filePath}
                onChange={(event) => setFilePath(event.target.value)}
                placeholder="src/worker-pool.ts"
                className="font-mono text-xs"
              />
            </Field>
            <Field label="File contents" htmlFor="submission-file-content">
              <Textarea
                id="submission-file-content"
                value={fileContent}
                onChange={(event) => setFileContent(event.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
            </Field>
            <Field label="Unified git diff patch" htmlFor="submission-patch">
              <Textarea
                id="submission-patch"
                value={patchText}
                onChange={(event) => setPatchText(event.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
            </Field>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            <Send className="size-4" /> Submit deliverable for verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DisputeDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open a dispute</DialogTitle>
          <DialogDescription>
            Opening a dispute pauses verification and payout settlement until resolved. Describe the issue clearly.
          </DialogDescription>
        </DialogHeader>
        <Field label="Dispute reason" htmlFor="dispute-reason" hint="At least 20 characters.">
          <Textarea
            id="dispute-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={2000}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(reason)} disabled={reason.trim().length < 20}>
            <Gavel className="size-4" /> Open dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RewardDialog({
  open,
  onOpenChange,
  currentMinor,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMinor: number;
  onSubmit: (rewardMinor: number) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState((currentMinor / 100).toFixed(2));
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust task reward</DialogTitle>
          <DialogDescription>
            Rewards can be adjusted before funding is captured. Amount is validated server-side.
          </DialogDescription>
        </DialogHeader>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Field label="Reward (USD)" htmlFor="edit-reward">
          <Input
            id="edit-reward"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode="decimal"
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              const amount = parseMoneyToMinor(value);
              if (!amount) {
                setError("Enter a valid dollar amount.");
                return;
              }
              onSubmit(amount);
            }}
          >
            Update reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
