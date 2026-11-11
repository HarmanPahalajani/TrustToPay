import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  GitBranch,
  History,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import {
  PayPalLogo,
  ElasticLogo,
  RenderLogo,
  GeminiLogo,
  JinaAiLogo,
  SupabaseLogo,
} from "@/components/partner-logos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_SUPPORTING_LINES = [
  "Find the right human expertise.",
  "Check the work before it returns.",
  "Send verified results back to your agent.",
] as const;

type WorkflowStep = {
  num: string;
  id: string;
  title: string;
  summary: string;
  detail: string;
  stageLabel: string;
  highlights: string[];
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    num: "01",
    id: "request",
    title: "Request & Task Setup",
    summary: "Describe what blocked the agent, set acceptance criteria, and fund the task.",
    detail:
      "When an AI agent reaches low confidence or needs real human judgment, it submits a bounded task with context, clear pass criteria, and a reward funded upfront.",
    stageLabel: "Payment ready",
    highlights: [
      "Clear title, question context, and acceptance criteria",
      "Skill domain and difficulty tags attached automatically",
      "Reward locked upfront before any specialist accepts work",
    ],
  },
  {
    num: "02",
    id: "matching",
    title: "Specialist Matching",
    summary: "Find suitable specialists by matching meaning and domain experience.",
    detail:
      "TrustToPay understands the intent of the request using Jina AI semantic understanding and combines it with Elasticsearch skill and domain retrieval.",
    stageLabel: "Find suitable specialists",
    highlights: [
      "Semantic matching paired with exact technical keyword matching",
      "Evaluates specialist profiles and certified domain areas",
      "No slow manual bidding or generic crowd lists",
    ],
  },
  {
    num: "03",
    id: "eligibility",
    title: "Eligibility & Priority Dispatch",
    summary: "Confirm verified skill levels and invite the top qualified specialists.",
    detail:
      "PostgreSQL verifies each candidate's certified skill level, availability, and role boundaries, then dispatches priority task offers to the top five specialists.",
    stageLabel: "Specialists notified",
    highlights: [
      "Enforces verified skill assessments from Level 1 to Level 3",
      "Prevents self-review and enforces strict role isolation",
      "Notifies the top five matching candidates immediately",
    ],
  },
  {
    num: "04",
    id: "execution",
    title: "Human Work & Evidence",
    summary: "A verified specialist resolves the blocker and attaches clear evidence.",
    detail:
      "An eligible specialist reviews the problem inside a focused workbench and submits code, structured explanations, and supporting references.",
    stageLabel: "Work submitted",
    highlights: [
      "Full task context and acceptance checklist in one workbench",
      "Supports structured answers, code files, and references",
      "Recorded file integrity checks on every submitted version",
    ],
  },
  {
    num: "05",
    id: "checks",
    title: "Security & Quality Checks",
    summary: "Automatic checks, AI safety review, and criteria verification run before release.",
    detail:
      "Submitted deliverables go through automated safety scans, Google Gemini inspection, and criteria checks so unsafe or off-target outputs are stopped early.",
    stageLabel: "Security checks",
    highlights: [
      "Automated checks scan for unsafe patterns and leaked credentials",
      "Google Gemini checks for prompt injection and criteria alignment",
      "Flagged submissions pause for additional security review",
    ],
  },
  {
    num: "06",
    id: "result",
    title: "Verified Result & Payment",
    summary: "Return a trusted, signed result so your agent can resume right away.",
    detail:
      "Once checks pass, TrustToPay delivers the verified answer with a secure digital signature back to your agent and records payment completion.",
    stageLabel: "Work verification",
    highlights: [
      "Clean, structured deliverable delivered back to the requesting agent",
      "Secure digital signature proves the result came from TrustToPay",
      "Complete task history and PayPal payment tracking in one ledger",
    ],
  },
];

const HERO_FLOW_NODES = [
  { label: "AI Agent", state: "Stuck on task", tone: "amber" },
  { label: "TrustToPay", state: "Finds match", tone: "cobalt" },
  { label: "Human Specialist", state: "Completes work", tone: "neutral" },
  { label: "Security Checks", state: "Passes safety review", tone: "cyan" },
  { label: "Verified Result", state: "Signed & checked", tone: "emerald" },
  { label: "AI Agent", state: "Resumes cleanly", tone: "emerald" },
] as const;

const DEV_SNIPPETS: Record<"mcp" | "rest" | "verify", { label: string; filename: string; code: string }> = {
  mcp: {
    label: "MCP Server Config",
    filename: "claude_desktop_config.json",
    code: `{
  "mcpServers": {
    "trusttopay": {
      "command": "node",
      "args": ["dist/mcp-server.js"],
      "env": {
        "TRUSTTOPAY_API_URL": "https://trusttopay-backend.onrender.com",
        "TRUSTTOPAY_API_KEY": "ttp_live_your_requester_token"
      }
    }
  }
}
// Available MCP tools:
// - trusttopay_create_task
// - trusttopay_get_task_status
// - trusttopay_get_verified_result
// - trusttopay_cancel_task`,
  },
  rest: {
    label: "REST Task Request",
    filename: "create-task.ts",
    code: `const response = await fetch("https://trusttopay-backend.onrender.com/api/v1/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.TRUSTTOPAY_TOKEN}\`,
  },
  body: JSON.stringify({
    category: "PROGRAMMING",
    title: "Verify session token revocation under concurrent refresh",
    description: "Agent flagged ambiguous session cleanup behavior on concurrent requests.",
    rewardMinor: 4500,
    urgency: "HIGH",
    acceptanceCriteria: [
      "Prevent stale refresh reuse",
      "Include regression test cases",
    ],
  }),
});`,
  },
  verify: {
    label: "Verify Digital Signature",
    filename: "verify-result.ts",
    code: `import crypto from "node:crypto";

const res = await fetch(\`\${API_URL}/api/v1/tasks/\${taskId}/handback\`, {
  headers: { Authorization: \`Bearer \${TRUSTTOPAY_TOKEN}\` },
});

const signature = res.headers.get("x-trusttopay-signature") ?? "";
const rawBody = await res.text();
const [tPart, v1Part] = signature.split(",");
const expected = crypto
  .createHmac("sha256", process.env.HANDBACK_SIGNING_SECRET!)
  .update(\`\${tPart.replace("t=", "")}.\${rawBody}\`)
  .digest("hex");

if (!crypto.timingSafeEqual(Buffer.from(v1Part.replace("v1=", "")), Buffer.from(expected))) {
  throw new Error("Invalid TrustToPay result signature");
}`,
  },
};

export default function LandingPage() {
  const { user } = useAuth();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState<"mcp" | "rest" | "verify">("mcp");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_SUPPORTING_LINES.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, []);

  const currentStep = WORKFLOW_STEPS[activeStepIndex];
  const snippet = DEV_SNIPPETS[activeCodeTab];

  async function copySnippet() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(snippet.code);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1800);
  }

  return (
    <div className="min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      <PublicHeader />

      {/* Top Partner Strip — directly below navbar and directly above hero */}
      <section
        aria-label="Powered by technology partners"
        className="border-b border-[#E4E9F2] bg-[#FFFFFF]"
      >
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-center gap-3 px-4 py-3.5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.16em] text-[#68738A]">POWERED BY</span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
            <PayPalLogo className="h-6 sm:h-7" />
            <ElasticLogo className="h-6 sm:h-7" />
            <RenderLogo className="h-6 sm:h-7" />
          </div>
        </div>
      </section>

      <main>
        {/* Solid Deep Navy Hero (zero gradients, zero blobs) */}
        <section id="product" className="border-b border-[#1E293B] bg-[#10172A] text-white">
          <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
              <div className="min-w-0 space-y-6">
                <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-[-0.025em] text-white sm:text-[46px] lg:text-[52px]">
                  When AI gets stuck, human expertise moves it forward.
                </h1>

                <div className="min-h-[30px]" aria-live="polite">
                  <p
                    key={HERO_SUPPORTING_LINES[phraseIndex]}
                    className="ttp-phrase-enter font-display text-lg font-semibold text-[#20BCE5] sm:text-xl"
                  >
                    {HERO_SUPPORTING_LINES[phraseIndex]}
                  </p>
                </div>

                <p className="max-w-xl text-[15px] leading-7 text-[#CBD5E1] sm:text-base">
                  TrustToPay connects blocked AI tasks with verified human specialists—checking every submitted answer
                  before returning a signed, trustworthy result to your workflow.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button asChild size="lg" variant="default" className="min-h-11 px-6">
                    <Link to={user ? "/app/workspace" : "/register?role=REQUESTER"}>
                      Start as a Requester <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="min-h-11 border-[#334155] bg-[#162038] px-6 text-white hover:border-[#4263EB] hover:bg-[#1B2541] hover:text-white"
                  >
                    <Link to={user ? "/app/onboarding/skills" : "/register?role=REVIEWER"}>
                      Become a Specialist <UserCheck className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="min-h-11 text-[#CBD5E1] hover:bg-[#162038] hover:text-white"
                  >
                    <Link to="/app/docs">Developer Docs</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-[#1E293B] pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Verified Specialists</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#94A3B8]">Matched by domain &amp; skill level</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Security Checks</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#94A3B8]">Automated &amp; AI safety inspection</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">PayPal Checkout</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#94A3B8]">Funded upfront before work starts</p>
                  </div>
                </div>
              </div>

              {/* Clean Execution Flow Visual (AI Agent -> TrustToPay -> Human Specialist -> Security Checks -> Verified Result -> AI Agent) */}
              <div className="min-w-0 rounded-2xl border border-[#1E293B] bg-[#162038] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B3754] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#12A875]" aria-hidden="true" />
                    <span className="font-display text-sm font-semibold text-white">
                      End-to-End Task Flow
                    </span>
                  </div>
                  <span className="rounded-full bg-[#10172A] px-3 py-1 text-xs font-medium text-[#CBD5E1]">
                    6 verified stages
                  </span>
                </div>

                <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {HERO_FLOW_NODES.map((node, index) => {
                    const dotColor =
                      node.tone === "emerald"
                        ? "bg-[#12A875]"
                        : node.tone === "amber"
                          ? "bg-[#F5A623]"
                          : node.tone === "cyan"
                            ? "bg-[#20BCE5]"
                            : node.tone === "cobalt"
                              ? "bg-[#4263EB]"
                              : "bg-[#CBD5E1]";
                    return (
                      <li
                        key={`${node.label}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#2B3754] bg-[#10172A] p-3.5"
                      >
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-[#94A3B8] tabular-nums">
                            0{index + 1}
                          </span>
                          <p className="mt-0.5 font-display text-sm font-semibold text-white">
                            {node.label}
                          </p>
                          <p className="mt-0.5 text-xs text-[#CBD5E1]">{node.state}</p>
                        </div>
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotColor)} aria-hidden="true" />
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#12A875]/35 bg-[#12A875]/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileCheck2 className="size-4 shrink-0 text-[#12A875]" />
                    <span>AI Agent → TrustToPay → Specialist → Security Checks → Verified Result → AI Agent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Step Equal-Height Workflow Cards */}
        <section id="workflow" className="border-b border-[#E4E9F2] bg-[#FFFFFF] py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                From request to verified result
              </h2>
              <p className="text-[15px] leading-6 text-[#4E596E]">
                Six simple steps take every task from the first request to the completed result.
              </p>
            </div>

            <div
              className="mt-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="tablist"
              aria-label="Workflow steps"
            >
              {WORKFLOW_STEPS.map((step, idx) => {
                const active = idx === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveStepIndex(idx)}
                    className={cn(
                      "flex h-full min-w-0 flex-col justify-between rounded-xl border p-5 text-left transition-colors",
                      active
                        ? "border-[#4263EB] bg-[#F5F7FC] ring-1 ring-[#4263EB]/25"
                        : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#CBD5E1] hover:bg-[#FAFBFD]",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex min-h-6 items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
                            active ? "bg-[#4263EB] text-white" : "bg-[#EDF0F6] text-[#4E596E]",
                          )}
                        >
                          {step.num}
                        </span>
                        <span className="text-xs font-medium text-[#68738A]">{step.stageLabel}</span>
                      </div>
                      <h3 className="mt-4 font-display text-base font-semibold text-[#141B2D]">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#4E596E]">{step.summary}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Synchronized Stage Details (full-width clean surface — zero overflow on mobile) */}
            <div className="mt-5 rounded-2xl border border-[#E4E9F2] bg-[#F5F7FC] p-6 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-[#4263EB] px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                      Step {currentStep.num}
                    </span>
                    <span className="text-xs font-semibold text-[#0B7D56]">{currentStep.stageLabel}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">{currentStep.title}</h3>
                  <p className="text-[15px] leading-6 text-[#4E596E]">{currentStep.detail}</p>
                </div>

                <ul className="space-y-2 border-t border-[#E4E9F2] pt-4 text-sm text-[#141B2D] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  {currentStep.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#12A875]" />
                      <span className="leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Sided Platform */}
        <section id="specialists" className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                Built for AI teams and verified human specialists
              </h2>
              <p className="text-[15px] leading-6 text-[#4E596E]">
                Clear separation between requesting work and completing verified specialist tasks.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-surface sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#4263EB]/10 text-[#4263EB]">
                      <Bot className="size-5" />
                    </span>
                    <span className="rounded-full bg-[#EDF0F6] px-3 py-1 text-xs font-semibold text-[#141B2D]">
                      For Requesters &amp; AI Teams
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">
                    Unblock AI workflows without sacrificing safety
                  </h3>
                  <p className="text-[15px] leading-6 text-[#4E596E]">
                    Connect via MCP tools, REST API, or the workspace console. Submit blocked tasks with clear
                    requirements and inspect verified results before resuming.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-[#141B2D]">
                    {[
                      "Attach problem descriptions, files, and clear acceptance checks",
                      "Find suitable specialists matched to exact task skills",
                      "Complete test payments cleanly with PayPal before work starts",
                      "Receive checked, digitally signed results ready for your agent",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#4263EB]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#E4E9F2] pt-5">
                  <Button asChild size="lg" variant="default">
                    <Link to="/register?role=REQUESTER">
                      Start as a Requester <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-surface sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#12A875]/10 text-[#12A875]">
                      <UserCheck className="size-5" />
                    </span>
                    <span className="rounded-full bg-[#12A875]/10 px-3 py-1 text-xs font-semibold text-[#0B7D56]">
                      For Verified Specialists
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">
                    Prove expertise through structured skill assessments
                  </h3>
                  <p className="text-[15px] leading-6 text-[#4E596E]">
                    Skip open-market bidding wars. Verify your skills sequentially across Foundation, Practitioner, and
                    Advanced levels to unlock matching tasks.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-[#141B2D]">
                    {[
                      "Multi-domain skill assessments tailored to your technical focus",
                      "Focused task briefs with clear acceptance requirements upfront",
                      "Reward amounts funded and visible before you claim a task",
                      "Transparent verification feedback and reward tracking",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#12A875]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#E4E9F2] pt-5">
                  <Button asChild size="lg" variant="navy">
                    <Link to="/register?role=REVIEWER">
                      Become a Specialist <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Verification (Deep Navy solid section) */}
        <section id="security" className="border-b border-[#1E293B] bg-[#10172A] py-16 text-white sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Every deliverable is checked before an AI agent trusts it
              </h2>
              <p className="text-[15px] leading-6 text-[#CBD5E1]">
                Submitted code and answers run through automated safety checks, AI policy review, and criteria
                verification before completion.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Automatic safety checks",
                  desc: "Scans submitted files for unsafe code patterns, risky system calls, and accidental credential leaks.",
                  accent: "text-[#20BCE5]",
                },
                {
                  icon: Sparkles,
                  title: "AI policy & safety review",
                  desc: "Google Gemini inspects submissions for hidden prompt injections and checks alignment with task goals.",
                  accent: "text-[#4263EB]",
                },
                {
                  icon: ShieldCheck,
                  title: "Work verification",
                  desc: "Verifies each submission against the task acceptance criteria before marking the task ready.",
                  accent: "text-[#12A875]",
                },
                {
                  icon: Lock,
                  title: "File integrity check",
                  desc: "Generates a unique integrity fingerprint for every submitted file set so nothing alters silently.",
                  accent: "text-[#7057F5]",
                },
                {
                  icon: KeyRound,
                  title: "Secure digital signature",
                  desc: "Signs every delivered result so your application can confirm it came authentically from TrustToPay.",
                  accent: "text-[#12A875]",
                },
                {
                  icon: History,
                  title: "Complete task progress log",
                  desc: "Records every status transition, check verdict, and payment action in a clear timeline.",
                  accent: "text-[#F5A623]",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-[#1E293B] bg-[#162038] p-5"
                  >
                    <Icon className={cn("size-5", card.accent)} />
                    <h3 className="mt-4 font-display text-base font-semibold text-white">{card.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#94A3B8]">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technology Partners */}
        <section className="border-b border-[#E4E9F2] bg-[#FFFFFF] py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                Trusted infrastructure across matching, verification, and payments
              </h2>
              <p className="text-[15px] leading-6 text-[#4E596E]">
                Built on proven platforms for semantic retrieval, security inspection, authentication, and checkout.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  logo: <PayPalLogo className="h-6" />,
                  desc: "Supports task reward checkout and clean payment tracking.",
                },
                {
                  logo: <ElasticLogo className="h-6" />,
                  desc: "Powers fast specialist search combining skills and context.",
                },
                {
                  logo: <RenderLogo className="h-6" />,
                  desc: "Hosts the TrustToPay web app, backend API, and PostgreSQL database.",
                },
                {
                  logo: <GeminiLogo className="h-5" />,
                  desc: "Runs AI security inspection and alignment checks on submissions.",
                },
                {
                  logo: <JinaAiLogo className="h-5" />,
                  desc: "Creates semantic understanding vectors to match tasks with specialists.",
                },
                {
                  logo: <SupabaseLogo className="h-5" />,
                  desc: "Handles secure user authentication, email verification, and password resets.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-5"
                >
                  <div>{item.logo}</div>
                  <p className="text-sm leading-6 text-[#4E596E]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Integration Preview */}
        <section id="developers" className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="min-w-0 space-y-5">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                  Connect via MCP tools or REST API
                </h2>
                <p className="text-[15px] leading-6 text-[#4E596E]">
                  Give AI assistants direct access to create human tasks, monitor progress, and fetch verified results.
                </p>

                <div className="space-y-3 pt-1">
                  {[
                    {
                      icon: Terminal,
                      title: "4 Built-In MCP Tools",
                      desc: "trusttopay_create_task · trusttopay_get_task_status · trusttopay_get_verified_result · trusttopay_cancel_task",
                      mono: true,
                    },
                    {
                      icon: GitBranch,
                      title: "MCP & REST Support",
                      desc: "Works with local coding assistants over MCP or HTTP API requests.",
                      mono: false,
                    },
                    {
                      icon: Wallet,
                      title: "Clear Payment & Verification States",
                      desc: "Every status transition is inspectable from first escalation to delivery.",
                      mono: false,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface">
                        <Icon className="mt-0.5 size-4 shrink-0 text-[#4263EB]" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#141B2D]">{item.title}</p>
                          <p
                            className={cn(
                              "mt-1 break-words text-xs leading-5 text-[#4E596E]",
                              item.mono && "font-mono text-[11px]",
                            )}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/app/docs">
                      Read Developer Docs <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-2xl border border-[#1E293B] bg-[#10172A] shadow-elevated">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] bg-[#162038] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Integration code snippets">
                    {(["mcp", "rest", "verify"] as const).map((tabKey) => (
                      <button
                        key={tabKey}
                        type="button"
                        role="tab"
                        aria-selected={activeCodeTab === tabKey}
                        onClick={() => setActiveCodeTab(tabKey)}
                        className={cn(
                          "min-h-8 rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                          activeCodeTab === tabKey
                            ? "bg-[#4263EB] text-white"
                            : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white",
                        )}
                      >
                        {DEV_SNIPPETS[tabKey].label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={copySnippet}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[#2B3754] bg-[#10172A] px-2.5 py-1 font-mono text-[11px] text-[#CBD5E1] hover:border-[#4263EB] hover:text-white"
                  >
                    {copiedCode ? <Check className="size-3.5 text-[#12A875]" /> : <Copy className="size-3.5" />}
                    {copiedCode ? "Copied" : snippet.filename}
                  </button>
                </div>
                <pre className="max-w-full overflow-x-auto p-5 font-mono text-xs leading-6 text-[#E2E8F0]">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#FFFFFF] py-16 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#E4E9F2] bg-[#F5F7FC] p-8 sm:flex-row sm:items-center sm:p-10">
              <div className="max-w-xl space-y-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                  Give your AI agents a reliable path forward.
                </h2>
                <p className="text-[15px] leading-6 text-[#4E596E]">
                  Open a Requester workspace to escalate tasks, or sign up as a Specialist to verify your skills.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="default">
                  <Link to="/register">
                    Get Started <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app/docs">API &amp; MCP Docs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
