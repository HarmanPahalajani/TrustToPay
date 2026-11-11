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
import { PaymentStatusBadge, StatusBadge } from "@/components/status-badges";
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
        title="Earnings & payouts"
        description="Track completed payouts and pending payments once submitted work passes safety checks."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/profile">
                <Wallet className="size-4" /> Payout profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/payments">
                All payments <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {!profileReady ? (
        <Alert tone="warning" icon={<Wallet className="size-4" />} title="Payout details are incomplete">
          Add a PayPal email and confirm payout consent on your profile so payments can be sent when tasks complete.
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed earnings"
          value={data.earnings.display}
          hint={`${data.completedPayoutCount} completed payment${data.completedPayoutCount === 1 ? "" : "s"}`}
          icon={<CircleDollarSign className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Pending payments"
          value={data.pendingRewards.display}
          hint={`${data.pendingRewardCount} payment${data.pendingRewardCount === 1 ? "" : "s"} in progress`}
          icon={<Clock className="size-4" />}
          tone={data.pendingRewardCount > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Active tasks"
          value={data.assignments.active}
          hint={`${data.assignments.completed} completed · ${data.assignments.total} total`}
          icon={<BadgeCheck className="size-4" />}
        />
        <StatCard
          label="Submitted work"
          value={data.submissionCount}
          hint="Tasks submitted for safety review"
          icon={<ShieldCheck className="size-4" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionHeading
            title="Recent task earnings"
            description="Each task shows its current progress and latest payment status."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/reviews">
                  My Active Work <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          />
          {data.recentPayouts.length === 0 ? (
            <EmptyState
              icon={<Banknote className="size-5" />}
              title="No earnings yet"
              description="Accept an available task and submit completed work to earn payouts once checks pass."
              action={
                <Button asChild size="sm">
                  <Link to="/app/marketplace">Browse available tasks</Link>
                </Button>
              }
            />
          ) : (
            <Card className="divide-y divide-[#E5E1D7]">
              {data.recentPayouts.map((row) => {
                const payout = row.payouts[0] ?? null;
                return (
                  <Link
                    key={row.taskId}
                    to={`/app/tasks/${row.taskId}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#F0EEE7]/60"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium text-[#202722]">{row.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={row.status} dot={false} />
                        {payout ? <PaymentStatusBadge status={payout.status} /> : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#202722] tabular-nums">
                        {row.reward ? formatMoney(row.reward.amountMinor, row.reward.currency) : "-"}
                      </p>
                      <p className="text-xs text-[#69736D]">
                        {payout?.paidAt
                          ? `Paid ${formatDate(payout.paidAt)}`
                          : payout
                            ? paymentStatusLabel(payout.status)
                            : "Payment pending"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}

          <SectionHeading
            className="mt-6"
            title="Payout history"
            description="Your payouts across completed tasks."
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/payments">
                  Filter &amp; export <ArrowRight className="size-3.5" />
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
              title="No payouts yet"
              description="Once completed work passes review, your payout record will appear here."
            />
          ) : (
            <Card className="divide-y divide-[#E5E1D7]">
              {payoutRows.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PaymentStatusBadge status={payment.status} />
                      <span className="text-xs text-[#69736D]">{payment.provider}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#69736D]">
                      {payment.task ? (
                        <Link to={`/app/tasks/${payment.task.id}`} className="font-medium text-[#202722] hover:text-[#365FEA]">
                          {payment.task.title}
                        </Link>
                      ) : (
                        "Task payout"
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#202722] tabular-nums">{payment.amountDisplay}</p>
                    <p className="text-xs text-[#69736D] tabular-nums">
                      {payment.paidAt ? `Paid ${formatDate(payment.paidAt)}` : formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <Card className={profileReady ? "border-[#438866]/35" : "border-[#C97A2E]/40"}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#202722]">
                <BadgeCheck className="size-4 text-[#365FEA]" /> Payout profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#69736D]">Status</span>
                <Badge tone={profileReady ? "success" : "warning"} dot>
                  {profileReady ? "Ready" : "Incomplete"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#69736D]">PayPal email</span>
                <span className="max-w-[180px] truncate font-medium text-[#202722]">
                  {data.payoutProfile?.email ?? "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#69736D]">Consent</span>
                <span className="font-medium text-[#202722]">{data.payoutProfile?.consent ? "Saved" : "Not given"}</span>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-1 w-full">
                <Link to="/app/profile">Update payout details</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#202722]">
                <FlaskConical className="size-4 text-[#C97A2E]" /> Payment labels explained
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-5 text-[#69736D]">
              <p>
                <span className="font-semibold text-[#202722]">Test payment</span> entries simulate payouts during
                testing and never move real money.
              </p>
              <p>
                <span className="font-semibold text-[#202722]">PayPal test payment</span> entries use PayPal&apos;s test
                environment without charging real money.
              </p>
              <p>
                Your completed tasks and submissions remain safely recorded even if automated payouts are paused.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4 text-xs leading-5 text-[#69736D]">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#202722]">
                <ExternalLink className="size-3.5 text-[#365FEA]" /> How payments work
              </p>
              <p>
                Task budgets are confirmed before any specialist accepts the work. Review checks and payouts run after
                completed work is submitted.
              </p>
              <p className="text-xs font-medium text-[#202722] tabular-nums">
                {data.availableCount} available · {data.assignments.total} accepted · {data.submissionCount} submitted
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
