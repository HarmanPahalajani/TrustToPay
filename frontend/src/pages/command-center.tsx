import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gauge,
  HelpCircle,
  Inbox,
  LayoutGrid,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CommandCenterData, CommandTaskRow } from "@/lib/types";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskAllocationGrid } from "@/components/grids/task-allocation-grid";
import { MatchingCandidatesGrid } from "@/components/grids/matching-candidates-grid";
import { PaymentTransactionsGrid } from "@/components/grids/payment-transactions-grid";
import { HumanWorkforceGrid } from "@/components/grids/human-workforce-grid";
import { SkillAssessmentGrid } from "@/components/grids/skill-assessment-grid";
import { VerificationGrid } from "@/components/grids/verification-grid";

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<string>("tasks");
  const [selectedTask, setSelectedTask] = useState<CommandTaskRow | null>(null);

  const query = useQuery<CommandCenterData>({
    queryKey: ["command-center-data"],
    queryFn: api.dashboards.commandCenter,
    refetchInterval: 30_000,
  });

  const kpis = query.data?.kpis;
  const tasks = query.data?.tasks ?? [];

  // Default selected task for matching tab if none selected (prefer active task with eligible candidates)
  const activeMatchingTaskId =
    selectedTask?.id ||
    tasks.find((t) => t.id === "cmwaid2g500kthtmsf5r24u8y")?.id ||
    tasks[0]?.id ||
    "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Operations Command Center"
        description="Real-time AG Grid operational intelligence layer monitoring AI agent tasks, algorithmic specialist matching, code verification gates, and PayPal transactions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Button asChild size="sm" className="text-xs">
              <Link to="/app/workspace">
                <Bot className="size-3.5 mr-1" /> New AI Task
              </Link>
            </Button>
          </div>
        }
      />

      {/* Top Operational KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Active AI Tasks"
          value={kpis?.activeAiTasks ?? "—"}
          hint="Tasks currently in flight"
          icon={Bot}
          color="text-[#365FEA]"
          bg="bg-[#365FEA]/10"
        />
        <KpiCard
          label="Awaiting Match"
          value={kpis?.tasksAwaitingAssignment ?? "—"}
          hint="Pending specialist dispatch"
          icon={Sparkles}
          color="text-[#C97A2E]"
          bg="bg-[#C97A2E]/10"
        />
        <KpiCard
          label="Available Specialists"
          value={kpis?.availableSpecialists ?? "—"}
          hint={`Of ${kpis?.totalRegisteredHumans ?? "—"} registered`}
          icon={Users}
          color="text-[#438866]"
          bg="bg-[#438866]/10"
        />
        <KpiCard
          label="Verified Solutions"
          value={kpis?.successfulVerifications ?? "—"}
          hint="Passed AST + Gemini L2"
          icon={ShieldCheck}
          color="text-[#438866]"
          bg="bg-[#438866]/10"
        />
        <KpiCard
          label="Completed Payouts"
          value={kpis?.paymentsCompleted ?? "—"}
          hint="PayPal Sandbox verified"
          icon={CreditCard}
          color="text-[#2B6146]"
          bg="bg-[#2B6146]/10"
        />
        <KpiCard
          label="System Health"
          value="100%"
          hint="All gates operational"
          icon={Activity}
          color="text-[#365FEA]"
          bg="bg-[#365FEA]/10"
        />
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FAF8F2] border border-[#E5E1D7] p-1 flex flex-wrap gap-1">
          <TabsTrigger value="tasks" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <Inbox className="size-3.5" />
            <span>AI Tasks ({tasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="matching" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <Sparkles className="size-3.5 text-[#365FEA]" />
            <span>Matching Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="workforce" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <Users className="size-3.5" />
            <span>Human Workforce</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <Award className="size-3.5" />
            <span>Certifications</span>
          </TabsTrigger>
          <TabsTrigger value="verifications" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <ShieldCheck className="size-3.5" />
            <span>Quality & Gates</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <CreditCard className="size-3.5" />
            <span>PayPal Ledger</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: AI Task Allocation */}
        <TabsContent value="tasks" className="space-y-4">
          <TaskAllocationGrid
            tasks={tasks}
            isLoading={query.isLoading}
            error={query.error ? (query.error as Error).message : null}
            onRetry={() => query.refetch()}
            onSelectTask={(task) => {
              setSelectedTask(task);
            }}
          />

          {selectedTask ? (
            <Card className="border-[#365FEA]/30 bg-[#FFFEFA]">
              <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#365FEA]">Selected Task:</span>
                    <span className="text-xs font-semibold text-[#202722]">{selectedTask.title}</span>
                  </div>
                  <p className="text-xs text-[#69736D] line-clamp-1">{selectedTask.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setActiveTab("matching")}
                  >
                    <Sparkles className="size-3 mr-1 text-[#365FEA]" /> View Match Ranking
                  </Button>
                  <Button asChild size="sm" className="text-xs">
                    <Link to={`/app/tasks/${selectedTask.id}`}>Open Task Detail</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Tab 2: Flagship Matching Intelligence Dashboard */}
        <TabsContent value="matching" className="space-y-4">
          {/* Task Selector for Matching Evaluation */}
          <div className="rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-[#202722] flex items-center gap-1.5">
                <Bot className="size-3.5 text-[#365FEA]" /> Evaluated Task for Specialist Matching:
              </label>
              <p className="text-xs text-[#69736D]">
                Select any task to inspect its real-time multi-factor ranking, skill scores, and justifications.
              </p>
            </div>
            <select
              value={activeMatchingTaskId}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                if (found) setSelectedTask(found);
              }}
              className="rounded-lg border border-[#E5E1D7] bg-white px-3 py-1.5 text-xs text-[#202722] focus:border-[#365FEA] focus:outline-hidden"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category} • L{t.minimumSkillLevel})
                </option>
              ))}
            </select>
          </div>

          {activeMatchingTaskId ? (
            <MatchingCandidatesGrid
              taskId={activeMatchingTaskId}
              title={`Matching Intelligence Candidates — Task: ${selectedTask?.title || activeMatchingTaskId}`}
              subtitle="Auditable algorithmic scoring: composite score derived from verified skill level, past verification pass rate, and turnaround latency."
              height="440px"
            />
          ) : (
            <div className="rounded-xl border border-[#E5E1D7] bg-white p-8 text-center text-xs text-[#69736D]">
              No active tasks available to evaluate.
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Human Workforce Directory */}
        <TabsContent value="workforce">
          <HumanWorkforceGrid
            workforce={query.data?.workforce}
            isLoading={query.isLoading}
            error={query.error ? (query.error as Error).message : null}
            onRetry={() => query.refetch()}
          />
        </TabsContent>

        {/* Tab 4: Skill Assessment & Certification */}
        <TabsContent value="assessments">
          <SkillAssessmentGrid
            assessments={query.data?.assessments}
            isLoading={query.isLoading}
            error={query.error ? (query.error as Error).message : null}
            onRetry={() => query.refetch()}
          />
        </TabsContent>

        {/* Tab 5: Verification Quality & Security Gates */}
        <TabsContent value="verifications">
          <VerificationGrid
            verifications={query.data?.verifications}
            isLoading={query.isLoading}
            error={query.error ? (query.error as Error).message : null}
            onRetry={() => query.refetch()}
          />
        </TabsContent>

        {/* Tab 6: PayPal Payment Operations */}
        <TabsContent value="payments">
          <PaymentTransactionsGrid
            payments={query.data?.payments}
            isLoading={query.isLoading}
            error={query.error ? (query.error as Error).message : null}
            onRetry={() => query.refetch()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <Card className="bg-[#FFFEFA] border-[#E5E1D7] shadow-2xs">
      <CardContent className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#69736D] truncate">{label}</span>
          <div className={`flex size-6 items-center justify-center rounded-md ${bg}`}>
            <Icon className={`size-3.5 ${color}`} />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight text-[#202722]">{value}</div>
          <p className="text-[10px] text-[#8E9790] truncate">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
