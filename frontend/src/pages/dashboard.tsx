import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Gauge,
  Inbox,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MetricTile, PageHeader, SectionHeading } from "@/components/common";
import { TaskRowCard } from "@/components/task-card";
import { PaymentStatusBadge, StatusBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate, formatMoney, timeAgo } from "@/lib/format";
import { taskStatusLabel } from "@/lib/status-labels";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <LoadingBlock label="Loading workspace…" />;
  if (user.role === "REVIEWER") return <ReviewerDashboard />;
  return <RequesterDashboard />;
}

const CHART_COLORS = ["#365FEA", "#438866", "#2B4FC7", "#5A9B7B", "#C97A2E", "#E5484D"];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {subtitle ? <span className="text-xs font-medium text-[#69736D]">{subtitle}</span> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RequesterDashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["dashboard", "agent"], queryFn: api.dashboards.agent });

  if (query.isLoading) return <LoadingBlock label="Loading overview…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "We couldn't load your overview right now."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const data = query.data;
  const sessionData = data.sessions.byStatus.map((row) => ({
    name: taskStatusLabel(row.status),
    count: row.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Requester"}`}
        description="Submit tasks when you need human expertise, follow specialist progress, and collect checked results."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/command-center">
                <Gauge className="size-4" /> Command Center
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/requests">
                <Inbox className="size-4" /> My Tasks
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/workspace">
                <Plus className="size-4" /> New Task
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Active tasks"
          value={data.tasks.active}
          hint={`${data.tasks.total} total tasks`}
          icon={<ClipboardList className="size-4" />}
          tone="info"
          to="/app/requests"
        />
        <MetricTile
          label="Payment pending"
          value={data.tasks.awaitingFunding}
          hint="Complete checkout to notify specialists"
          icon={<CreditCard className="size-4" />}
          tone={data.tasks.awaitingFunding > 0 ? "warning" : "neutral"}
          to="/app/requests?status=AWAITING_FUNDING"
        />
        <MetricTile
          label="Total paid"
          value={data.funding.display}
          hint={`${data.fundingCount} completed payment${data.fundingCount === 1 ? "" : "s"}`}
          icon={<Wallet className="size-4" />}
          tone="success"
          to="/app/payments"
        />
        <MetricTile
          label="Completed tasks"
          value={data.approvedRewards.display}
          hint={`${data.approvedRewardCount} finished task${data.approvedRewardCount === 1 ? "" : "s"}`}
          icon={<CheckCircle2 className="size-4" />}
          to="/app/payments?type=PAYOUT"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-6">
          <SectionHeading
            title="Recent tasks"
            action={
              <Link to="/app/requests" className="text-sm font-semibold text-[#365FEA] hover:underline">
                View all tasks →
              </Link>
            }
          />
          {data.recentTasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-5" />}
              title="No tasks yet"
              description="Share a task with supporting notes to match with a qualified human specialist."
              action={
                <Button asChild size="default">
                  <Link to="/app/workspace">Create your first task</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.recentTasks.map((task) => (
                <TaskRowCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {sessionData.length > 0 ? (
            <ChartCard title="Tasks by status" subtitle="Live activity breakdown">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#69736D", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#69736D", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFEFA",
                        border: "1px solid #E5E1D7",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        color: "#202722",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={34}>
                      {sessionData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <SectionHeading
            title="Recent requests"
            action={
              <Link to="/app/workspace" className="text-sm font-semibold text-[#365FEA] hover:underline">
                New task →
              </Link>
            }
          />
          {data.recentSessions.length === 0 ? (
            <Card className="p-6 text-center text-sm text-[#69736D]">
              No requests submitted yet. Create a task to get started.
            </Card>
          ) : (
            <Card className="divide-y divide-[#E5E1D7]">
              {data.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/app/sessions/${session.id}`}
                  className="block p-4 transition-colors hover:bg-[#F7F5EF]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={session.status} />
                    <span className="text-xs text-[#69736D] tabular-nums">
                      {session.confidence != null
                        ? `${Math.round(session.confidence * 100)}% clarity`
                        : "Ready for check"}{" "}
                      · {timeAgo(session.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 font-display text-sm font-semibold text-[#202722]">
                    {session.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#69736D]">
                    {session.action ? taskStatusLabel(session.action) : "Ready to review and confirm"}
                  </p>
                </Link>
              ))}
            </Card>
          )}

          <QuickStartGuide />
        </div>
      </div>
    </div>
  );
}

function QuickStartGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#365FEA]" /> How tasks complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-[13px] text-[#69736D]">
        <ol className="space-y-2.5 leading-5">
          {[
            "Describe what you need help with and add any helpful notes or files.",
            "Review the initial summary, confirm what should be included, and set your budget.",
            "Complete checkout so TrustToPay can notify qualified specialists.",
            "Receive your completed result once automatic safety checks pass.",
          ].map((step, idx) => (
            <li key={step} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F0EEE7] text-xs font-bold text-[#202722] tabular-nums">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ReviewerDashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["dashboard", "reviewer"], queryFn: api.dashboards.reviewer });

  if (query.isLoading) return <LoadingBlock label="Loading overview…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "We couldn't load your overview right now."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const data = query.data;
  const payoutReady = Boolean(data.payoutProfile?.consent && data.payoutProfile?.email);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ready for work, ${user?.name ?? "Specialist"}`}
        description="Browse tasks matched to your verified skills, submit clear work, and track safety reviews and earnings."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/command-center">
                <Gauge className="size-4" /> Command Center
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/onboarding/skills">
                <Award className="size-4" /> Skill Verification
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/marketplace">
                <BriefcaseBusiness className="size-4" /> Browse Available Tasks
              </Link>
            </Button>
          </>
        }
      />

      {!payoutReady ? (
        <Alert
          tone="warning"
          icon={<Wallet className="size-4 text-[#C97A2E]" />}
          title="Finish setting up payouts"
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/app/profile">Update Profile</Link>
            </Button>
          }
        >
          Add your PayPal email and payout preference in your profile so your earnings can be sent smoothly.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Available tasks"
          value={data.availableCount}
          hint="Ready for you to accept"
          icon={<BriefcaseBusiness className="size-4" />}
          tone="info"
          to="/app/marketplace"
        />
        <MetricTile
          label="Work in progress"
          value={data.assignments.active}
          hint="Accepted or ready to submit"
          icon={<Inbox className="size-4" />}
          tone={data.assignments.active > 0 ? "warning" : "neutral"}
          to="/app/reviews"
        />
        <MetricTile
          label="Pending earnings"
          value={data.pendingRewards.display}
          hint={`${data.pendingRewardCount} payment${data.pendingRewardCount === 1 ? "" : "s"} in progress`}
          icon={<CreditCard className="size-4" />}
          tone="warning"
          to="/app/earnings"
        />
        <MetricTile
          label="Completed earnings"
          value={data.earnings.display}
          hint={`${data.completedPayoutCount} completed payout${data.completedPayoutCount === 1 ? "" : "s"}`}
          icon={<Wallet className="size-4" />}
          tone="success"
          to="/app/earnings"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-4">
          <SectionHeading
            title="Matching tasks available"
            action={
              <Link to="/app/marketplace" className="text-sm font-semibold text-[#365FEA] hover:underline">
                Browse all →
              </Link>
            }
          />
          {data.availableTasks.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness className="size-5" />}
              title="No matching tasks right now"
              description="New tasks appear here as soon as requesters complete payment and match your verified skills."
              action={
                <Button asChild size="default" variant="outline">
                  <Link to="/app/onboarding/skills">Verify More Skills</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.availableTasks.map((task) => (
                <TaskRowCard key={task.id} task={task} showRequester />
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Verified Skills</CardTitle>
                <Link to="/app/onboarding/skills" className="text-xs font-semibold text-[#365FEA] hover:underline">
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.skills.length === 0 ? (
                <div className="rounded-lg bg-[#F0EEE7] p-4 text-center">
                  <p className="text-xs leading-5 text-[#69736D]">
                    No verified skills yet. Complete a skill check to unlock matching tasks.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link to="/app/onboarding/skills">Start Skill Verification</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill) => (
                    <Badge key={skill} tone="cobalt" dot>
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="border-t border-[#E5E1D7] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#69736D]">Payout profile</span>
                  <Badge tone={payoutReady ? "success" : "warning"} dot>
                    {payoutReady ? "Ready" : "Incomplete"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent earnings</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[#E5E1D7] pt-1">
              {data.recentPayouts.length === 0 ? (
                <p className="py-3 text-xs text-[#69736D]">No earnings recorded yet.</p>
              ) : (
                data.recentPayouts.map((row) => {
                  const latestPayout = row.payouts[0] ?? null;
                  return (
                    <Link
                      key={row.taskId}
                      to={`/app/tasks/${row.taskId}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[#F7F5EF]"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-[#202722]">{row.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PaymentStatusBadge status={latestPayout?.status ?? row.status} />
                        </div>
                        {latestPayout ? (
                          <p className="truncate text-xs text-[#69736D] tabular-nums">
                            {formatDate(latestPayout.createdAt)}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-sans text-base font-bold text-[#202722] tabular-nums">
                        {row.reward
                          ? formatMoney(row.reward.amountMinor, row.reward.currency)
                          : latestPayout?.amountDisplay ?? "—"}
                      </span>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
