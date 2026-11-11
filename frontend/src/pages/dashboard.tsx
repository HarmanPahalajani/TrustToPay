import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Inbox,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MetricTile, PageHeader, SectionHeading } from "@/components/common";
import { TaskRowCard } from "@/components/task-card";
import {
  ModeBadge,
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/status-badges";
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

const CHART_COLORS = ["#4263EB", "#12A875", "#7057F5", "#20BCE5", "#F5A623", "#E5484D"];

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
          {subtitle ? <span className="text-xs font-medium text-[#68738A]">{subtitle}</span> : null}
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
        message={(query.error as Error)?.message ?? "Dashboard could not load."}
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
        description="Submit tasks when AI needs human help, track specialist matching and security checks, and collect verified results."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/requests">
                <Inbox className="size-4" /> My Tasks
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/workspace">
                <Plus className="size-4" /> New Request
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
          icon={<Bot className="size-4" />}
          tone="info"
          to="/app/requests"
        />
        <MetricTile
          label="Waiting for payment"
          value={data.tasks.awaitingFunding}
          hint="Complete checkout to notify specialists"
          icon={<CreditCard className="size-4" />}
          tone={data.tasks.awaitingFunding > 0 ? "warning" : "neutral"}
          to="/app/requests?status=AWAITING_FUNDING"
        />
        <MetricTile
          label="Total funded"
          value={data.funding.display}
          hint={`${data.fundingCount} completed payment${data.fundingCount === 1 ? "" : "s"}`}
          icon={<Wallet className="size-4" />}
          tone="success"
          to="/app/payments"
        />
        <MetricTile
          label="Verified rewards"
          value={data.approvedRewards.display}
          hint={`${data.approvedRewardCount} completed task${data.approvedRewardCount === 1 ? "" : "s"}`}
          icon={<CheckCircle2 className="size-4" />}
          to="/app/payments?type=PAYOUT"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-6">
          <SectionHeading
            title="Recent tasks"
            action={
              <Link to="/app/requests" className="text-sm font-semibold text-[#4263EB] hover:underline">
                View all tasks →
              </Link>
            }
          />
          {data.recentTasks.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No tasks created yet"
              description="Submit a question or task in the AI Workspace to match with a qualified human specialist."
              action={
                <Button asChild size="default">
                  <Link to="/app/workspace">Open AI Workspace</Link>
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
            <ChartCard title="Requests by status" subtitle="Live activity breakdown">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#68738A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#68738A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E9F2",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        color: "#141B2D",
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
            title="Recent AI requests"
            action={
              <Link to="/app/workspace" className="text-sm font-semibold text-[#4263EB] hover:underline">
                Open workspace →
              </Link>
            }
          />
          {data.recentSessions.length === 0 ? (
            <Card className="p-6 text-center text-sm text-[#68738A]">
              No requests submitted yet. Start in the AI Workspace.
            </Card>
          ) : (
            <Card className="divide-y divide-[#E4E9F2]">
              {data.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/app/sessions/${session.id}`}
                  className="block p-4 transition-colors hover:bg-[#FAFBFD]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={session.status} />
                    <span className="text-xs text-[#68738A] tabular-nums">
                      {session.confidence != null
                        ? `${Math.round(session.confidence * 100)}% confidence`
                        : "Pending analysis"}{" "}
                      · {timeAgo(session.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 font-display text-sm font-semibold text-[#141B2D]">
                    {session.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#4E596E]">
                    {session.action ? taskStatusLabel(session.action) : "Ready for confidence review"}
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
          <ShieldCheck className="size-4 text-[#4263EB]" /> How tasks complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-[13px] text-[#4E596E]">
        <ol className="space-y-2.5 leading-5">
          {[
            "Submit a question with supporting notes in the AI Workspace.",
            "Run an initial confidence analysis to spot gaps or uncertainties.",
            "Create a specialist task, review matching candidates, and authorize payment.",
            "Collect your result once security checks and work verification pass.",
          ].map((step, idx) => (
            <li key={step} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EDF0F6] text-xs font-bold text-[#141B2D] tabular-nums">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="border-t border-[#E4E9F2] pt-3">
          <Link to="/app/docs" className="inline-flex items-center gap-1 text-xs font-semibold text-[#4263EB] hover:underline">
            Read API &amp; MCP Docs <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewerDashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["dashboard", "reviewer"], queryFn: api.dashboards.reviewer });

  if (query.isLoading) return <LoadingBlock label="Loading specialist workbench…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "Dashboard could not load."}
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
        description="Find funded tasks matched to your certified skills, submit clear solutions, and track verification and rewards."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/onboarding/skills">
                <Award className="size-4" /> Skill Credentials
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
          icon={<Wallet className="size-4 text-[#9A6100]" />}
          title="Complete your reward profile"
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/app/profile">Update Profile</Link>
            </Button>
          }
        >
          Save your PayPal email and payout preference in your profile so verified rewards can be tracked properly.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Available tasks"
          value={data.availableCount}
          hint="Ready for you to claim"
          icon={<BriefcaseBusiness className="size-4" />}
          tone="info"
          to="/app/marketplace"
        />
        <MetricTile
          label="Active assignments"
          value={data.assignments.active}
          hint="In progress or waiting submission"
          icon={<Inbox className="size-4" />}
          tone={data.assignments.active > 0 ? "warning" : "neutral"}
          to="/app/reviews"
        />
        <MetricTile
          label="Pending rewards"
          value={data.pendingRewards.display}
          hint={`${data.pendingRewardCount} authorized reward${data.pendingRewardCount === 1 ? "" : "s"}`}
          icon={<CreditCard className="size-4" />}
          tone="warning"
          to="/app/earnings"
        />
        <MetricTile
          label="Recorded earnings"
          value={data.earnings.display}
          hint={`${data.completedPayoutCount} completed reward${data.completedPayoutCount === 1 ? "" : "s"}`}
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
              <Link to="/app/marketplace" className="text-sm font-semibold text-[#4263EB] hover:underline">
                Browse all →
              </Link>
            }
          />
          {data.availableTasks.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness className="size-5" />}
              title="No matching tasks right now"
              description="New tasks appear as soon as requesters complete payment and your verified skill level qualifies."
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
                <Link to="/app/onboarding/skills" className="text-xs font-semibold text-[#4263EB] hover:underline">
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.skills.length === 0 ? (
                <div className="rounded-lg bg-[#F5F7FC] p-4 text-center">
                  <p className="text-xs leading-5 text-[#68738A]">
                    No verified skills yet. Complete assessments to qualify for matching tasks.
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
              <div className="border-t border-[#E4E9F2] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#68738A]">Payout profile</span>
                  <Badge tone={payoutReady ? "success" : "warning"} dot>
                    {payoutReady ? "Ready" : "Incomplete"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent rewards</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[#E4E9F2] pt-1">
              {data.recentPayouts.length === 0 ? (
                <p className="py-3 text-xs text-[#68738A]">No rewards recorded yet.</p>
              ) : (
                data.recentPayouts.map((row) => {
                  const latestPayout = row.payouts[0] ?? null;
                  return (
                    <Link
                      key={row.taskId}
                      to={`/app/tasks/${row.taskId}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[#FAFBFD]"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-[#141B2D]">{row.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PaymentStatusBadge status={latestPayout?.status ?? row.status} />
                          {latestPayout ? (
                            <ModeBadge mode={latestPayout.mode === "SANDBOX" ? "SANDBOX" : "SIMULATED"} />
                          ) : null}
                        </div>
                        {latestPayout ? (
                          <p className="truncate text-xs text-[#68738A] tabular-nums">
                            {formatDate(latestPayout.createdAt)}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-sans text-base font-bold text-[#141B2D] tabular-nums">
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
