import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Clock,
  ExternalLink,
  FlaskConical,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatCard, SectionHeading } from "@/components/common";
import { ModeBadge, PaymentStatusBadge, StatusBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status-labels";

export default function EarningsPage() {
  const dashboard = useQuery({
    queryKey: ["dashboard", "reviewer"],
    queryFn: api.dashboards.reviewer,
  });

  const payouts = useQuery({
    queryKey: ["payments", { type: "PAYOUT", page: 1 }],
    queryFn: () => api.payments.list({ type: "PAYOUT", pageSize: 50 }),
  });

  if (dashboard.isLoading) return <LoadingBlock label="Loading your earnings..." />;
  if (dashboard.error || !dashboard.data) {
    return (
      <ErrorState
        message={(dashboard.error as Error)?.message ?? "Earnings are unavailable."}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  const data = dashboard.data;
  const profileReady = Boolean(data.payoutProfile?.consent && data.payoutProfile?.email);
  const payoutRows = payouts.data?.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rewards and payout history"
        description="Track completed payouts and authorized rewards once submitted work passes security and quality checks."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/profile">
                <Wallet className="size-4" /> Payout profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/payments">
                Full ledger <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {!profileReady ? (
        <Alert tone="warning" icon={<Wallet className="size-4" />} title="Payout details are incomplete">
          Add a PayPal email and confirm payout consent on your profile so verified rewards can be released when
          payouts are enabled.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed earnings"
          value={data.earnings.display}
          hint={`${data.completedPayoutCount} completed payout${data.completedPayoutCount === 1 ? "" : "s"}`}
          icon={<CircleDollarSign className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Pending rewards"
          value={data.pendingRewards.display}
          hint={`${data.pendingRewardCount} authorized or processing`}
          icon={<Clock className="size-4" />}
          tone={data.pendingRewardCount > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Active assignments"
          value={data.assignments.active}
          hint={`${data.assignments.completed} completed · ${data.assignments.total} total`}
          icon={<BadgeCheck className="size-4" />}
        />
        <StatCard
          label="Submissions"
          value={data.submissionCount}
          hint="Answers submitted for independent verification"
          icon={<ShieldCheck className="size-4" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionHeading
            title="Recent reward activity"
            description="Each task shows the current task state and its latest payout state."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/reviews">
                  My reviews <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          />
          {data.recentPayouts.length === 0 ? (
            <EmptyState
              icon={<Banknote className="size-5" />}
              title="No reward activity yet"
              description="Accept a funded review, submit an evidenced answer, and the reward appears here after verification."
              action={
                <Button asChild size="sm">
                  <Link to="/app/marketplace">Browse marketplace</Link>
                </Button>
              }
            />
          ) : (
            <Card className="divide-y divide-border">
              {data.recentPayouts.map((row) => {
                const payout = row.payouts[0] ?? null;
                return (
                  <Link
                    key={row.taskId}
                    to={`/app/tasks/${row.taskId}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">{row.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={row.status} dot={false} />
                        {payout ? <ModeBadge mode={payout.mode as "SIMULATED" | "SANDBOX"} /> : null}
                        {payout ? <PaymentStatusBadge status={payout.status} /> : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#141B2D] tabular-nums">
                        {row.reward ? formatMoney(row.reward.amountMinor, row.reward.currency) : "-"}
                      </p>
                      <p className="text-xs text-[#68738A]">
                        {payout?.paidAt
                          ? `Paid ${formatDate(payout.paidAt)}`
                          : payout
                            ? paymentStatusLabel(payout.status)
                            : "No payout yet"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}

          <SectionHeading
            className="mt-6"
            title="Payout transactions"
            description="Your specialist payout ledger across completed tasks."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/payments">
                  Filter and export <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          />
          {payouts.isLoading ? (
            <LoadingBlock label="Loading payouts..." />
          ) : payouts.error ? (
            <ErrorState message={(payouts.error as Error).message} onRetry={() => payouts.refetch()} />
          ) : payoutRows.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-5" />}
              title="No payout transactions"
              description="Once a verified reward is released, the payout entry appears here with its payment reference."
            />
          ) : (
            <Card className="divide-y divide-[#E4E9F2]">
              {payoutRows.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PaymentStatusBadge status={payment.status} />
                      <ModeBadge mode={payment.mode} />
                      <span className="text-xs text-[#68738A]">{payment.provider}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#68738A]">
                      {payment.task ? (
                        <Link to={`/app/tasks/${payment.task.id}`} className="font-medium text-[#141B2D] hover:text-[#4263EB]">
                          {payment.task.title}
                        </Link>
                      ) : (
                        payment.taskId
                      )}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-[#68738A]">
                      {payment.payoutBatchId ?? payment.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#141B2D] tabular-nums">{payment.amountDisplay}</p>
                    <p className="text-xs text-[#68738A] tabular-nums">
                      {payment.paidAt ? `Paid ${formatDate(payment.paidAt)}` : formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <Card className={profileReady ? "border-[#12A875]/35" : "border-[#F5A623]/40"}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BadgeCheck className="size-4 text-[#4263EB]" /> Payout profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#68738A]">Status</span>
                <Badge tone={profileReady ? "success" : "warning"} dot>
                  {profileReady ? "Ready" : "Incomplete"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#68738A]">PayPal email</span>
                <span className="max-w-[180px] truncate font-medium text-[#141B2D]">
                  {data.payoutProfile?.email ?? "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#68738A]">Consent</span>
                <span className="font-medium text-[#141B2D]">{data.payoutProfile?.consent ? "Recorded" : "Not given"}</span>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-1 w-full">
                <Link to="/app/profile">Update payout details</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="size-4 text-[#9A6100]" /> Payment labels explained
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-5 text-[#68738A]">
              <p>
                <span className="font-semibold text-[#141B2D]">Practice mode</span> rows run locally for testing and
                never move real money.
              </p>
              <p>
                <span className="font-semibold text-[#141B2D]">PayPal test mode</span> rows use PayPal&apos;s test
                environment—no real money is transferred.
              </p>
              <p>
                If a payout fails or payouts are unavailable on the merchant account, your verified task and answer
                stay safely recorded.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4 text-xs leading-5 text-[#68738A]">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#141B2D]">
                <ExternalLink className="size-3.5 text-[#4263EB]" /> How rewards work
              </p>
              <p>
                Task funding is reserved before any specialist accepts the task. Verification and payout run as separate
                steps after submission.
              </p>
              <p className="text-xs font-medium text-[#141B2D] tabular-nums">
                {data.availableCount} available · {data.assignments.total} assigned · {data.submissionCount} submitted
              </p>
              <Button asChild size="sm" variant="ghost" className="w-full">
                <Link to="/app/docs#paypal">How payments work</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
