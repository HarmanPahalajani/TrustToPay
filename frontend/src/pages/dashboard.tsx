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
import { PaymentModeBanner } from "@/components/payment-mode-banner";
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
import { formatDate, formatMoney, humanize, timeAgo } from "@/lib/format";

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
          <CardTitle className="text-sm">{title}</CardTitle>
          {subtitle ? <span className="font-mono text-[11px] text-[#68738A]">{subtitle}</span> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RequesterDashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["dashboard", "agent"], queryFn: api.dashboards.agent });

  if (query.isLoading) return <LoadingBlock label="Loading agent operations dashboard…" />;
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
    name: humanize(row.status),
    count: row.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Requester Workspace"
        title={`Welcome back, ${user?.name ?? "Requester"}`}
        description="Submit agent blockers, inspect specialist offers and hybrid retrieval progress, fund approved tasks, and collect signed verified results."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/requests">
                <Inbox className="size-4" /> My tasks
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/workspace">
                <Plus className="size-4" /> New question
              </Link>
            </Button>
          </>
        }
      />

      <PaymentModeBanner compact />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Active tasks"
          value={data.tasks.active}
          hint={`${data.tasks.total} total review tasks`}
          icon={<Bot className="size-4" />}
          tone="info"
          to="/app/requests"
        />
        <MetricTile
          label="Awaiting funding"
          value={data.tasks.awaitingFunding}
          hint="PayPal Checkout opens claims"
          icon={<CreditCard className="size-4" />}
          tone={data.tasks.awaitingFunding > 0 ? "warning" : "neutral"}
          to="/app/requests?status=AWAITING_FUNDING"
        />
        <MetricTile
          label="Escrow funded"
          value={data.funding.display}
          hint={`${data.fundingCount} captured order${data.fundingCount === 1 ? "" : "s"}`}
          icon={<Wallet className="size-4" />}
          tone="success"
          to="/app/payments"
        />
        <MetricTile
          label="Verified payouts"
          value={data.approvedRewards.display}
          hint={`${data.approvedRewardCount} settled task${data.approvedRewardCount === 1 ? "" : "s"}`}
          icon={<CheckCircle2 className="size-4" />}
          to="/app/payments?type=PAYOUT"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Escalations"
            title="Recent review tasks"
            action={
              <Link to="/app/requests" className="text-xs font-semibold text-[#4263EB] hover:underline">
                View all requests →
              </Link>
            }
          />
          {data.recentTasks.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No review tasks yet"
              description="Submit a technical blocker in the Agent Workspace. When confidence drops below threshold or evidence conflicts, the engine creates a review task."
              action={
                <Button asChild size="sm">
                  <Link to="/app/workspace">Open Agent Workspace</Link>
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
            <ChartCard title="Agent session status distribution" subtitle="Live PostgreSQL breakdown">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#68738A", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#68738A", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E9F2",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#141B2D",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
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

        <div className="space-y-4">
          <SectionHeading
            eyebrow="Agent Activity"
            title="Recent agent sessions"
            action={
              <Link to="/app/workspace" className="text-xs font-semibold text-[#4263EB] hover:underline">
                Open workspace →
              </Link>
            }
          />
          {data.recentSessions.length === 0 ? (
            <Card className="p-6 text-center text-xs text-[#68738A]">
              No sessions recorded yet. Start in the Agent Workspace.
            </Card>
          ) : (
            <Card className="divide-y divide-[#E4E9F2]">
              {data.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/app/sessions/${session.id}`}
                  className="block p-4 transition-colors hover:bg-[#F5F7FC]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={session.status} />
                    <span className="font-mono text-[11px] text-[#68738A]">
                      {session.confidence != null
                        ? `${Math.round(session.confidence * 100)}% conf`
                        : "Unanalyzed"}{" "}
                      · {timeAgo(session.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 font-display text-sm font-bold text-[#141B2D]">{session.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#68738A]">
                    {session.action ? humanize(session.action) : "Ready for confidence triage"}
                  </p>
                </Link>
              ))}
            </Card>
          )}

          <DemoScenarioGuide />
        </div>
      </div>
    </div>
  );
}

function DemoScenarioGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 text-[#4263EB]" /> Execution Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-[#4E596E]">
        <ol className="space-y-2.5 leading-5">
          {[
            "Submit an ambiguous question with evidence in Agent Workspace.",
            "Run AI analysis and inspect detected specification conflicts.",
            "Create the review task, verify Jina + Elastic matching, and fund via PayPal.",
            "Verify specialist deliverables pass scanners, Gemini, and isolated execution.",
          ].map((step, idx) => (
            <li key={step} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EDF0F6] font-mono text-[10px] font-bold text-[#141B2D]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="border-t border-[#E4E9F2] pt-3">
          <Link to="/app/docs#demo" className="inline-flex items-center gap-1 font-semibold text-[#4263EB] hover:underline">
            Full documentation <ArrowRight className="size-3.5" />
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
        eyebrow="Specialist Workbench"
        title={`Ready for review, ${user?.name ?? "Specialist"}`}
        description="Claim ranked offers matching your certified skill levels, submit verifiable artifacts, and track verified PayPal Sandbox payouts."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/onboarding/skills">
                <Award className="size-4" /> Skill Credentials
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/marketplace">
                <BriefcaseBusiness className="size-4" /> Open marketplace
              </Link>
            </Button>
          </>
        }
      />

      <PaymentModeBanner compact />

      {!payoutReady ? (
        <Alert
          tone="warning"
          icon={<Wallet className="size-4 text-[#D48806]" />}
          title="Add a PayPal payout email and consent to unlock rewards"
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/app/profile">Complete payout profile</Link>
            </Button>
          }
        >
          Verified rewards cannot create a payout until both your PayPal email and explicit recipient consent are saved.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Open marketplace"
          value={data.availableCount}
          hint="Funded & eligible offers"
          icon={<BriefcaseBusiness className="size-4" />}
          tone="info"
          to="/app/marketplace"
        />
        <MetricTile
          label="Active assignments"
          value={data.assignments.active}
          hint="Claimed & awaiting submission"
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
          label="Completed earnings"
          value={data.earnings.display}
          hint={`${data.completedPayoutCount} completed payout${data.completedPayoutCount === 1 ? "" : "s"}`}
          icon={<Wallet className="size-4" />}
          tone="success"
          to="/app/earnings"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Matched Offers"
            title="Available in marketplace"
            action={
              <Link to="/app/marketplace" className="text-xs font-semibold text-[#4263EB] hover:underline">
                Browse all →
              </Link>
            }
          />
          {data.availableTasks.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness className="size-5" />}
              title="No matching tasks right now"
              description="New tasks appear once requesters capture funding and your verified skill profile qualifies."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/onboarding/skills">Certify More Skills</Link>
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

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Verified Credentials</CardTitle>
                <Link to="/app/onboarding/skills" className="text-xs font-semibold text-[#4263EB] hover:underline">
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.skills.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#E4E9F2] bg-[#F5F7FC] p-4 text-center">
                  <p className="text-xs font-medium text-[#68738A]">
                    No verified skills yet. Complete L1–L3 assessments to unlock higher-match routing.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link to="/app/onboarding/skills">Start Onboarding</Link>
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
              <CardTitle className="text-sm">Recent payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.recentPayouts.length === 0 ? (
                <p className="text-xs text-[#68738A]">No payouts created yet.</p>
              ) : (
                data.recentPayouts.map((row) => {
                  const latestPayout = row.payouts[0] ?? null;
                  return (
                    <Link
                      key={row.taskId}
                      to={`/app/tasks/${row.taskId}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#E4E9F2] bg-[#F5F7FC] p-2.5 transition-colors hover:border-[#4263EB]/40"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-xs font-semibold text-[#141B2D]">{row.title}</p>
                        <div className="flex flex-wrap items-center gap-1">
                          <PaymentStatusBadge status={latestPayout?.status ?? row.status} />
                          {latestPayout ? (
                            <ModeBadge mode={latestPayout.mode === "SANDBOX" ? "SANDBOX" : "SIMULATED"} />
                          ) : null}
                        </div>
                        {latestPayout ? (
                          <p className="truncate font-mono text-[10px] text-[#68738A]">
                            {formatDate(latestPayout.createdAt)}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-display text-sm font-bold text-[#141B2D] tabular-nums">
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
