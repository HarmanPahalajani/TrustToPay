import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  FileCheck2,
  GitBranch,
  KeyRound,
  Layers,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkflowStep = {
  num: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  system: string;
  badge: string;
  payloadTitle: string;
  payload: string[];
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    num: "01",
    id: "escalate",
    title: "Agent Escalates Task",
    subtitle: "Context, criteria & escrow",
    description:
      "When an autonomous agent encounters conflicting requirements, ambiguous runtime behavior, or production risk, it packages a bounded escalation with acceptance criteria, evidence files, and escrow reward.",
    system: "MCP / REST Ingestion",
    badge: "Step 01",
    payloadTitle: "POST /api/v1/tasks",
    payload: [
      'category: "PROGRAMMING"',
      'title: "Verify JWT session revocation race under concurrent refresh"',
      "rewardMinor: 4500 // $45.00 USD",
      'acceptanceCriteria: ["Atomic token family invalidation", "Regression unit test"]',
    ],
  },
  {
    num: "02",
    id: "matching",
    title: "Semantic Matching",
    subtitle: "Jina AI + Elasticsearch",
    description:
      "Jina AI embeds the technical problem description and acceptance requirements into dense vectors. Elasticsearch executes hybrid BM25 + semantic retrieval across indexed specialist profiles.",
    system: "Jina AI · Elasticsearch",
    badge: "Step 02",
    payloadTitle: "Hybrid Vector + Lexical Query",
    payload: [
      "embedding_model: jina-embeddings-v3",
      'bm25_fields: ["verified_skills", "domain_bio"]',
      "vector_cosine_weight: 0.65",
      "candidate_pool_size: 48 specialists evaluated",
    ],
  },
  {
    num: "03",
    id: "ranking",
    title: "Eligibility & Ranking",
    subtitle: "PostgreSQL & Top-5 dispatch",
    description:
      "PostgreSQL filters candidates by proctored skill level (L1 Foundation to L3 Advanced), active availability, and conflict-of-interest rules, then dispatches live offers to the top five specialists.",
    system: "PostgreSQL · Ranking Engine",
    badge: "Step 03",
    payloadTitle: "Top-5 Offer Dispatch",
    payload: [
      "filter: verified_level >= required_level",
      "exclude: requester_id == candidate_id",
      "dispatch_window: top 5 ranked candidates",
      'offer_status: "PENDING_RESPONSE"',
    ],
  },
  {
    num: "04",
    id: "execution",
    title: "Human Execution",
    subtitle: "Certified specialist resolution",
    description:
      "An eligible specialist claims the offer, inspects attached specifications or diff context inside the workbench, and submits an immutable artifact bundle with supporting technical evidence.",
    system: "Specialist Workbench",
    badge: "Step 04",
    payloadTitle: "Immutable Submission Bundle",
    payload: [
      "artifact_version: v1",
      'files: ["src/auth/refresh.ts", "tests/refresh.test.ts"]',
      "sha256: 8b94f1c2e7a0482b9d1305c6a4d09e12...",
      "evidenceNotes: verified race fix under concurrent calls",
    ],
  },
  {
    num: "05",
    id: "verification",
    title: "Security & Verification",
    subtitle: "Scanners, Gemini & Sandbox",
    description:
      "Before results can return to the AI workflow, submissions pass deterministic static security scanners, Google Gemini prompt-injection and policy inspection, and isolated sandbox execution.",
    system: "Scanners · Gemini · Sandbox",
    badge: "Step 05",
    payloadTitle: "Layered Verification Gate",
    payload: [
      "deterministic_scanner: 0 critical findings",
      "gemini_security_gate: PASS (prompt injection clean)",
      "isolated_runner: PASSED (network: disabled, exit: 0)",
      "criteria_checks: 4 / 4 verified",
    ],
  },
  {
    num: "06",
    id: "handback",
    title: "Signed Result & Payment",
    subtitle: "HMAC handback & PayPal settlement",
    description:
      "TrustToPay signs the final handback payload with HMAC-SHA256 so the caller can verify authenticity, unlocks PayPal Sandbox settlement in the ledger, and resumes the paused AI workflow.",
    system: "HMAC-SHA256 · PayPal",
    badge: "Step 06",
    payloadTitle: "GET /api/v1/tasks/:id/handback",
    payload: [
      "header: X-TrustToPay-Signature: t=...,v1=...",
      'verification_status: "PASSED"',
      "artifact_sha256_verified: true",
      'payment_ledger: "PAYPAL_SANDBOX_CAPTURED"',
    ],
  },
];

const ARCHITECTURE_FLOW = [
  {
    step: "01",
    name: "Jina AI Embeddings",
    detail: "Encodes task blockers, logs & acceptance criteria into semantic vectors.",
    accent: "bg-[#20BCE5]",
  },
  {
    step: "02",
    name: "Elasticsearch Hybrid Search",
    detail: "Combines semantic similarity with exact lexical skill matching.",
    accent: "bg-[#4263EB]",
  },
  {
    step: "03",
    name: "PostgreSQL Eligibility",
    detail: "Enforces verified L1–L3 levels, payout consent & role separation.",
    accent: "bg-[#7057F5]",
  },
  {
    step: "04",
    name: "Top-5 Ranking & Dispatch",
    detail: "Ranks qualified candidates and routes time-bounded offers.",
    accent: "bg-[#4263EB]",
  },
  {
    step: "05",
    name: "Human Execution",
    detail: "Specialist produces code patches, evidence & confidence notes.",
    accent: "bg-[#10172A]",
  },
  {
    step: "06",
    name: "Gemini + Sandbox Verification",
    detail: "Deterministic scans, AI safety gate & signed HMAC handback.",
    accent: "bg-[#12A875]",
  },
];

const DEV_SNIPPETS: Record<
  "mcp" | "rest" | "verify",
  { label: string; filename: string; code: string }
> = {
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
// Exposed MCP tools:
// - trusttopay_create_task
// - trusttopay_get_task_status
// - trusttopay_get_verified_result
// - trusttopay_cancel_task`,
  },
  rest: {
    label: "REST Escalation",
    filename: "escalate.ts",
    code: `const response = await fetch("https://trusttopay-backend.onrender.com/api/v1/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.TRUSTTOPAY_TOKEN}\`,
  },
  body: JSON.stringify({
    category: "PROGRAMMING",
    title: "Audit Postgres RLS policy on multi-tenant billing table",
    description: "Agent detected ambiguous fallback rule when tenant_id is null.",
    rewardMinor: 5000,
    urgency: "HIGH",
    acceptanceCriteria: [
      "Prevent cross-tenant row leakage",
      "Include verification test script",
    ],
  }),
});`,
  },
  verify: {
    label: "Verify Handback Signature",
    filename: "verify-handback.ts",
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
  throw new Error("Invalid TrustToPay handback signature");
}`,
  },
};

export default function LandingPage() {
  const { user } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState<"mcp" | "rest" | "verify">("mcp");
  const [copiedCode, setCopiedCode] = useState(false);

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

      {/* MANDATORY TOP PARTNER STRIP — Directly below Header, directly above Hero */}
      <section
        aria-label="Powered by technology partners"
        className="border-b border-[#E4E9F2] bg-[#FFFFFF]"
      >
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-center gap-3 px-4 py-3.5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#68738A]">
            POWERED BY
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
            <PayPalLogo className="h-6 sm:h-7" />
            <ElasticLogo className="h-6 sm:h-7" />
            <RenderLogo className="h-6 sm:h-7" />
          </div>
        </div>
      </section>

      <main>
        {/* HERO SECTION — Solid light surface + subtle dot texture (ZERO blue gradients) */}
        <section id="product" className="ttp-grid-dots border-b border-[#E4E9F2] bg-[#F5F7FC]">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E9F2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#141B2D] shadow-surface">
                  <span className="size-2 rounded-full bg-[#12A875]" aria-hidden="true" />
                  <span>Human Execution Layer for Autonomous AI Agents</span>
                </div>

                <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#141B2D] sm:text-5xl sm:leading-[1.08]">
                  When AI gets stuck, human expertise moves it forward.
                </h1>

                <p className="max-w-xl text-base leading-7 text-[#4E596E] sm:text-[17px]">
                  TrustToPay is developer infrastructure that lets autonomous AI agents escalate blockers to qualified,
                  assessed human specialists—returning verified, cryptographically signed artifacts settled through
                  PayPal.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button asChild size="lg" variant="default">
                    <Link to={user ? "/app/workspace" : "/register?role=REQUESTER"}>
                      Start as a Requester <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="navy">
                    <Link to={user ? "/app/onboarding/skills" : "/register?role=REVIEWER"}>
                      Become a Specialist <UserCheck className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/app/docs">MCP &amp; API Docs</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-[#E4E9F2] pt-5 sm:grid-cols-3">
                  <div className="flex items-start gap-2.5">
                    <Search className="mt-0.5 size-4 shrink-0 text-[#4263EB]" />
                    <div>
                      <p className="text-xs font-bold text-[#141B2D]">Hybrid Specialist Routing</p>
                      <p className="text-[11px] leading-4 text-[#68738A]">Jina AI vectors + Elastic search</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                    <div>
                      <p className="text-xs font-bold text-[#141B2D]">Verified Artifacts</p>
                      <p className="text-[11px] leading-4 text-[#68738A]">Scanners, Gemini &amp; isolated tests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <KeyRound className="mt-0.5 size-4 shrink-0 text-[#7057F5]" />
                    <div>
                      <p className="text-xs font-bold text-[#141B2D]">Signed Handback</p>
                      <p className="text-[11px] leading-4 text-[#68738A]">HMAC-SHA256 + SHA-256 hash</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Execution Pipeline Architecture Diagram */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#10172A] p-5 text-white shadow-elevated sm:p-6">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#12A875]" />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#CBD5E1]">
                      Execution Pipeline Schematic
                    </span>
                  </div>
                  <span className="rounded bg-[#1B2541] px-2 py-0.5 font-mono text-[10px] text-[#20BCE5]">
                    MCP / REST v1
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {/* Node 1: AI Agent -> Orchestration */}
                  <div className="grid items-center gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#2B3754] bg-[#162038] p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                          <Bot className="size-4 text-[#20BCE5]" /> AI Agent
                        </span>
                        <span className="font-mono text-[10px] text-[#F5A623]">BLOCKED</span>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] text-[#94A3B8]">
                        Escalates ambiguous auth race + $45 escrow
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#4263EB]/60 bg-[#182547] p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                          <Cpu className="size-4 text-[#4263EB]" /> TrustToPay Engine
                        </span>
                        <span className="font-mono text-[10px] text-[#20BCE5]">MATCHING</span>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] text-[#CBD5E1]">
                        Jina AI + Elastic → PostgreSQL Top-5
                      </p>
                    </div>
                  </div>

                  {/* Connector row */}
                  <div className="flex items-center justify-center gap-2 py-0.5">
                    <div className="h-4 w-px bg-[#334155]" />
                    <span className="rounded-full border border-[#2B3754] bg-[#162038] px-2.5 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                      Ranked Offer Dispatch
                    </span>
                    <div className="h-4 w-px bg-[#334155]" />
                  </div>

                  {/* Node 2: Specialist Nodes */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: "Security L3", score: "0.94 match", active: true },
                      { role: "Backend L2", score: "0.89 match", active: false },
                      { role: "Cloud L3", score: "0.84 match", active: false },
                    ].map((node) => (
                      <div
                        key={node.role}
                        className={cn(
                          "rounded-lg border p-2.5 text-center",
                          node.active
                            ? "border-[#12A875] bg-[#12A875]/15"
                            : "border-[#2B3754] bg-[#162038]",
                        )}
                      >
                        <UserCheck
                          className={cn(
                            "mx-auto size-4",
                            node.active ? "text-[#12A875]" : "text-[#94A3B8]",
                          )}
                        />
                        <p className="mt-1 text-[11px] font-bold text-white">{node.role}</p>
                        <p className="font-mono text-[10px] text-[#94A3B8]">{node.score}</p>
                      </div>
                    ))}
                  </div>

                  {/* Node 3: Verification & Signed Handback */}
                  <div className="rounded-xl border border-[#2B3754] bg-[#162038] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                        <ShieldCheck className="size-4 text-[#12A875]" /> Verification &amp; Security Layer
                      </span>
                      <span className="rounded bg-[#12A875]/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#34D399]">
                        ALL CHECKS PASSED
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-[10px] text-[#CBD5E1]">
                      <div className="rounded border border-[#2B3754] bg-[#10172A] px-2 py-1.5">
                        Scanner: 0 alerts
                      </div>
                      <div className="rounded border border-[#2B3754] bg-[#10172A] px-2 py-1.5">
                        Gemini: Safe
                      </div>
                      <div className="rounded border border-[#2B3754] bg-[#10172A] px-2 py-1.5">
                        Sandbox: Exit 0
                      </div>
                    </div>
                  </div>

                  {/* Final Signed Return */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#12A875]/50 bg-[#12A875]/10 px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <FileCheck2 className="size-4 text-[#12A875]" />
                      <span>Signed Result Returned to AI Agent</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#CBD5E1]">
                      SHA-256 · HMAC Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW TRUSTTOPAY WORKS — 6-Step Interactive Workflow */}
        <section id="workflow" className="border-b border-[#E4E9F2] bg-[#FFFFFF] py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                End-to-End Execution Lifecycle
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                Six deterministic stages from blocker to verified handback.
              </h2>
              <p className="text-sm leading-6 text-[#68738A]">
                Every task follows an explicit, inspectable state machine spanning specialist matching, isolated
                verification, and PayPal escrow settlement.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-2.5 sm:grid-cols-2" role="tablist" aria-label="Workflow steps">
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
                        "flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-[#4263EB] bg-[#F5F7FC] shadow-surface ring-1 ring-[#4263EB]/20"
                          : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#CBD5E1] hover:bg-[#F5F7FC]",
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                            active
                              ? "bg-[#4263EB] text-white"
                              : "bg-[#EDF0F6] text-[#4E596E]",
                          )}
                        >
                          {step.num}
                        </span>
                        <span className="font-mono text-[10px] text-[#68738A]">{step.system}</span>
                      </div>
                      <h3 className="mt-3 font-display text-sm font-bold text-[#141B2D]">{step.title}</h3>
                      <p className="mt-0.5 text-xs text-[#68738A]">{step.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Inspector Panel */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#E4E9F2] bg-[#F5F7FC] p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="cobalt">{currentStep.badge}</Badge>
                    <span className="font-mono text-xs font-medium text-[#68738A]">{currentStep.system}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">{currentStep.title}</h3>
                  <p className="text-sm leading-6 text-[#4E596E]">{currentStep.description}</p>
                </div>

                <div className="mt-6 rounded-xl border border-[#1E293B] bg-[#10172A] p-4 text-[#CBD5E1]">
                  <div className="mb-2 flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <span className="font-mono text-[11px] font-semibold text-[#20BCE5]">
                      {currentStep.payloadTitle}
                    </span>
                    <Terminal className="size-3.5 text-[#64748B]" />
                  </div>
                  <div className="space-y-1 font-mono text-xs leading-6">
                    {currentStep.payload.map((line) => (
                      <div key={line} className="truncate text-[#E2E8F0]">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TWO-SIDED PLATFORM — AI Developers & Human Specialists */}
        <section id="specialists" className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                Dual-Sided Execution Protocol
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                Strict role isolation for Requesters and verified Specialists.
              </h2>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* For AI Developers */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-surface sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#4263EB]/10 text-[#4263EB]">
                      <Bot className="size-5" />
                    </span>
                    <Badge tone="cobalt">For AI Developers &amp; Requesters</Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">
                    Unblock autonomous pipelines without compromising trust
                  </h3>
                  <p className="text-sm leading-6 text-[#68738A]">
                    Integrate directly via MCP tools or REST API. Escalate failing builds, ambiguous architecture calls,
                    and compliance reviews with deterministic verification gating every handback.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-[#141B2D]">
                    {[
                      "Structured blocker capture with acceptance criteria and attached files",
                      "Hybrid semantic matching to top-5 verified specialists only",
                      "Automatic PayPal Sandbox or labelled local escrow tracking",
                      "HMAC-SHA256 signed response payloads ready for automated resume",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4263EB]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#E4E9F2] pt-5">
                  <Button asChild variant="default">
                    <Link to="/register?role=REQUESTER">
                      Start as a Requester <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* For Human Specialists */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-surface sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#12A875]/10 text-[#12A875]">
                      <UserCheck className="size-5" />
                    </span>
                    <Badge tone="success">For Verified Specialists</Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#141B2D]">
                    Prove technical proficiency through proctored assessments
                  </h3>
                  <p className="text-sm leading-6 text-[#68738A]">
                    No self-reported star ratings or bidding wars. Certify concrete domain levels from L1 Foundation to
                    L3 Advanced, receive high-fit offers, and earn verified rewards.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-[#141B2D]">
                    {[
                      "Multi-domain skill catalogue spanning languages, security, cloud & systems",
                      "Proctored camera & screen-share sequential credentialing (L1 → L2 → L3)",
                      "Pre-funded task escrow visible before you claim any assignment",
                      "Explicit PayPal recipient consent and transparent payment reconciliation",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#E4E9F2] pt-5">
                  <Button asChild variant="navy">
                    <Link to="/register?role=REVIEWER">
                      Become a Specialist <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY ARCHITECTURE — High-Impact Deep Navy Section (#10172A, solid) */}
        <section id="security" className="ttp-grid-dots-dark border-b border-[#1E293B] bg-[#10172A] py-14 text-white sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#20BCE5]">
                Defense-in-Depth Verification
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Every human deliverable is verified before an AI agent trusts it.
              </h2>
              <p className="text-sm leading-6 text-[#94A3B8]">
                Submitted code, patches, and technical explanations pass multi-layer static analysis, LLM safety
                inspection, and isolated execution checks before settlement.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Deterministic Code Scanning",
                  desc: "Inspects submitted files and diffs for dangerous patterns, hardcoded secrets, and unsafe shell invocations before execution.",
                  accent: "text-[#20BCE5]",
                },
                {
                  icon: Sparkles,
                  title: "Gemini Security Inspection",
                  desc: "Evaluates deliverables for prompt-injection vectors, social engineering payloads, and alignment with the task specification.",
                  accent: "text-[#4263EB]",
                },
                {
                  icon: Terminal,
                  title: "Isolated Verification Runner",
                  desc: "Executes verification checks inside a memory-capped sandbox with outbound network access disabled.",
                  accent: "text-[#12A875]",
                },
                {
                  icon: Layers,
                  title: "SHA-256 Artifact Digests",
                  desc: "Every uploaded file tree and unified diff receives an immutable SHA-256 hash stored alongside its verification run.",
                  accent: "text-[#7057F5]",
                },
                {
                  icon: KeyRound,
                  title: "HMAC-SHA256 Signed Handback",
                  desc: "Handback endpoints emit a timestamped HMAC signature header so autonomous consumers validate payload authenticity.",
                  accent: "text-[#12A875]",
                },
                {
                  icon: Database,
                  title: "Immutable Audit Ledger",
                  desc: "Task transitions, security verdicts, and PayPal Sandbox order/payout events append to a verifiable event timeline.",
                  accent: "text-[#F5A623]",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-[#1E293B] bg-[#162038] p-5"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg border border-[#2B3754] bg-[#10172A]">
                      <Icon className={cn("size-4", card.accent)} />
                    </div>
                    <h3 className="mt-4 font-display text-sm font-bold text-white">{card.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-[#94A3B8]">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TECHNOLOGY ARCHITECTURE & INFRASTRUCTURE PARTNERS */}
        <section className="border-b border-[#E4E9F2] bg-[#FFFFFF] py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                Technical Architecture
              </p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                Built on production retrieval, relational integrity, and verifiable settlement.
              </h2>
            </div>

            {/* Horizontal 6-Node Flow */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {ARCHITECTURE_FLOW.map((node) => (
                <div
                  key={node.step}
                  className="flex flex-col justify-between rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#68738A]">{node.step}</span>
                      <span className={cn("size-2 rounded-full", node.accent)} />
                    </div>
                    <h3 className="mt-3 font-display text-xs font-bold text-[#141B2D]">{node.name}</h3>
                    <p className="mt-1.5 text-[11px] leading-4 text-[#68738A]">{node.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Stack Strip (PayPal, Elastic, Render, Google Gemini, Jina AI, Supabase) */}
            <div className="mt-10 rounded-2xl border border-[#E4E9F2] bg-[#F5F7FC] p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#68738A]">
                Infrastructure &amp; AI Stack
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    logo: <PayPalLogo className="h-6" />,
                    desc: "Orders v2 escrow funding checkout and Sandbox settlement tracking.",
                  },
                  {
                    logo: <ElasticLogo className="h-6" />,
                    desc: "Hybrid lexical and dense-vector specialist indexing and retrieval.",
                  },
                  {
                    logo: <RenderLogo className="h-6" />,
                    desc: "Managed cloud runtime hosting frontend, API services, and PostgreSQL.",
                  },
                  {
                    logo: <GeminiLogo className="h-5" />,
                    desc: "Security classification and artifact alignment inspection gate.",
                  },
                  {
                    logo: <JinaAiLogo className="h-5" />,
                    desc: "High-dimensional semantic embeddings for task-to-skill matching.",
                  },
                  {
                    logo: <SupabaseLogo className="h-5" />,
                    desc: "PKCE identity verification, password recovery, and session auth.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between gap-2.5 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface"
                  >
                    <div>{item.logo}</div>
                    <p className="text-xs leading-5 text-[#68738A]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DEVELOPER INTEGRATION PREVIEW (MCP, REST, Handback) */}
        <section id="developers" className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                  Developer Integration
                </p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                  Connect via Model Context Protocol or standard REST.
                </h2>
                <p className="text-sm leading-6 text-[#68738A]">
                  Equip coding agents and automated workflows with dedicated MCP tools for escalation, status polling,
                  and cryptographic handback retrieval.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      icon: Terminal,
                      title: "4 Built-In MCP Tools",
                      desc: "trusttopay_create_task, trusttopay_get_task_status, trusttopay_get_verified_result, trusttopay_cancel_task",
                    },
                    {
                      icon: GitBranch,
                      title: "Agent Skill & STDIO/HTTP Transport",
                      desc: "Works locally over STDIO or over authenticated Streamable HTTP endpoints.",
                    },
                    {
                      icon: Wallet,
                      title: "Explicit Payment State Labels",
                      desc: "Clear runtime telemetry distinguishes SIMULATED demo mode from PayPal Sandbox orders.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-3.5">
                        <Icon className="mt-0.5 size-4 shrink-0 text-[#4263EB]" />
                        <div>
                          <p className="text-xs font-bold text-[#141B2D]">{item.title}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#68738A]">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline">
                    <Link to="/app/docs">
                      Read full developer documentation <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Code Inspector */}
              <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#10172A] shadow-elevated">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] bg-[#162038] px-4 py-2.5">
                  <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Integration code snippets">
                    {(["mcp", "rest", "verify"] as const).map((tabKey) => (
                      <button
                        key={tabKey}
                        type="button"
                        role="tab"
                        aria-selected={activeCodeTab === tabKey}
                        onClick={() => setActiveCodeTab(tabKey)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#2B3754] bg-[#10172A] px-2.5 py-1 font-mono text-[11px] text-[#CBD5E1] hover:border-[#4263EB] hover:text-white"
                  >
                    {copiedCode ? <Check className="size-3 text-[#12A875]" /> : <Copy className="size-3" />}
                    {copiedCode ? "Copied" : snippet.filename}
                  </button>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-6 text-[#E2E8F0]">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="bg-[#FFFFFF] py-14 sm:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#E4E9F2] bg-[#F5F7FC] p-8 sm:flex-row sm:items-center sm:p-10">
              <div className="max-w-xl space-y-2">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
                  Ready to Deploy
                </p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D] sm:text-3xl">
                  Give your AI agents a way forward.
                </h2>
                <p className="text-sm leading-6 text-[#68738A]">
                  Create a Requester workspace to escalate tasks via API or MCP, or certify your domain skills as a
                  Specialist.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="default">
                  <Link to="/register">
                    Get Started <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/app/integrations">
                    <Code2 className="size-4" /> Integration Status
                  </Link>
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
