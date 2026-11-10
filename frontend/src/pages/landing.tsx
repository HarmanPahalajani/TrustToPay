import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { FibreArcCanvas, GrinIrisEye } from "@/components/hero/originkit-hero-shaders";
import { Hero22NeuralBrain } from "@/components/hero/hero22-neural-brain";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkflowStep = {
  number: string;
  tabLabel: string;
  title: string;
  phase: string;
  actor: string;
  endpoint: string;
  description: string;
  invariants: string[];
  payloadTitle: string;
  payloadCode: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: "01",
    tabLabel: "Step 1 — AI encounters a blocker",
    title: "AI Agent Hits a Blocker & Evaluates Confidence",
    phase: "Detection & Guardrail",
    actor: "Autonomous Agent / Server Analysis Engine",
    endpoint: "POST /api/v1/sessions/:id/analyze",
    description:
      "When an AI agent encounters contradictory evidence, missing runtime specifications, or security-sensitive code paths, the server-side analysis engine computes a structured confidence score and forces escalation on any critical conflict.",
    invariants: [
      "Critical specification or security conflicts force ESCALATE_TO_HUMAN regardless of raw score",
      "Output is strictly schema-validated before persisting the analysis run",
      "The client browser cannot override the server's escalation threshold",
    ],
    payloadTitle: "Analysis Escalation Verdict",
    payloadCode: `{
  "recommendedAction": "ESCALATE_TO_HUMAN",
  "confidenceScore": 0.41,
  "threshold": 0.75,
  "conflictingClaims": [
    {
      "severity": "CRITICAL",
      "sourceA": "src/worker-pool.ts",
      "claimA": "MAX_WORKERS = 4 (no AbortController timeout)",
      "sourceB": "production-runbook.md",
      "claimB": "12 workers with 30,000ms request abort bound"
    }
  ]
}`,
  },
  {
    number: "02",
    tabLabel: "Step 2 — Task creation",
    title: "Bounded Task Created with Explicit Acceptance Criteria",
    phase: "Task Encapsulation",
    actor: "Requester / Agent Operator",
    endpoint: "POST /api/v1/tasks",
    description:
      "The escalated blocker is packaged into a narrowly scoped review task containing the exact question, supplied evidence documents, verifiable acceptance criteria, required specialist skills, and minimum skill level (L1–L3).",
    invariants: [
      "Tasks start in AWAITING_FUNDING and cannot be claimed before funding capture",
      "Reward bounds are validated in integer minor units on the server",
      "Required skill tags and minimum verification level (L1–L3) are locked on creation",
    ],
    payloadTitle: "Bounded Task Specification",
    payloadCode: `{
  "sessionId": "sess_9f3a81c2",
  "category": "PROGRAMMING",
  "minimumSkillLevel": 2,
  "requiredSkills": ["Node.js Runtime", "Concurrency & Queues"],
  "rewardMinor": 2500,
  "currency": "USD",
  "status": "AWAITING_FUNDING"
}`,
  },
  {
    number: "03",
    tabLabel: "Step 3 — Intelligent specialist matching",
    title: "Elastic Hybrid Discovery + PostgreSQL Source-of-Truth Revalidation",
    phase: "Discovery & Ranking",
    actor: "ElasticSpecialistDiscoveryService + MatchingEngine",
    endpoint: "POST /api/v1/tasks/:id/dispatch-offers",
    description:
      "Elasticsearch executes a hybrid BM25 keyword + Jina vector similarity search to discover specialists with relevant expertise. PostgreSQL then revalidates every candidate's account eligibility, sequential L1–L3 skill badges, and active workload.",
    invariants: [
      "Relational database remains the authoritative source of truth for eligibility and skill levels",
      "Specialists at max concurrent workload (3 active tasks) are automatically filtered out",
      "Graceful fallback to deterministic relational matching if Elastic is unconfigured or times out",
    ],
    payloadTitle: "Hybrid Candidate Ranking",
    payloadCode: `{
  "discovery": {
    "mode": "ELASTIC_HYBRID",
    "embeddingModel": "jina-embeddings-v3",
    "revalidatedInDatabase": true
  },
  "topCandidates": [
    { "specialistId": "usr_elena", "verifiedLevel": 3, "score": 96, "activeWorkload": 1 },
    { "specialistId": "usr_marcus", "verifiedLevel": 2, "score": 91, "activeWorkload": 0 }
  ]
}`,
  },
  {
    number: "04",
    tabLabel: "Step 4 — Top-five dispatch",
    title: "Top-Five Parallel Offer Wave & Atomic First-Accept Locking",
    phase: "Offer Broadcast",
    actor: "OfferDispatchService",
    endpoint: "POST /api/v1/tasks/:id/dispatch-offers",
    description:
      "Instead of a slow single-queue assignment, TrustToPay dispatches expiring offers in parallel to the top 5 ranked specialists. The first eligible specialist to accept claims the task atomically inside a database transaction.",
    invariants: [
      "Up to 5 parallel expiring offers dispatched per batch wave",
      "Atomic transaction lock guarantees exactly one winner and supersedes sibling offers",
      "Expired batches can roll over to the next ranked specialist wave without duplicate assignment",
    ],
    payloadTitle: "Atomic Offer Claim Transaction",
    payloadCode: `{
  "batchNumber": 1,
  "dispatchedCount": 5,
  "acceptedOffer": {
    "offerId": "off_71b9",
    "rank": 1,
    "status": "ACCEPTED",
    "supersededSiblingOffers": 4
  },
  "taskStatus": "REVIEWER_ASSIGNED"
}`,
  },
  {
    number: "05",
    tabLabel: "Step 5 — Human resolves the problem",
    title: "Specialist Submits Code Deliverable & Verbatim Evidence",
    phase: "Human Resolution",
    actor: "Assigned Specialist",
    endpoint: "POST /api/v1/tasks/:id/submit",
    description:
      "The specialist submits a structured conclusion, technical explanation, authoritative HTTPS source with verbatim quoted excerpt, and optional code files or unified git diff patches canonicalized into an immutable SHA-256 artifact.",
    invariants: [
      "Every submission creates a versioned, immutable CodeArtifact with a canonical SHA-256 digest",
      "Path traversal (../), absolute paths, and binary executables are rejected on upload",
      "External URLs must be HTTPS and accompanied by a verbatim quoted excerpt",
    ],
    payloadTitle: "Immutable Code Artifact Submission",
    payloadCode: `{
  "submissionVersion": 1,
  "confidenceScore": 92,
  "artifact": {
    "version": 1,
    "fileCount": 1,
    "sha256Digest": "8f94d2c1b7e04a319c5d7e8b1204f9a3d6c8e1b2a4f09c3d8e7b6a5f4c3b2a10",
    "files": [{ "path": "src/worker-pool.ts", "sizeBytes": 412 }]
  }
}`,
  },
  {
    number: "06",
    tabLabel: "Step 6 — Security review",
    title: "Layered Deterministic + Gemini Security Gate",
    phase: "Security Inspection",
    actor: "SecurityGateService.inspectSubmission",
    endpoint: "POST /api/v1/tasks/:id/verify",
    description:
      "Submitted artifacts pass through a two-layer security gate: first, a deterministic scanner checks for hardcoded secrets, prompt injection, shell execution, and dangerous APIs; second, Gemini evaluates semantic backdoors and risk.",
    invariants: [
      "Deterministic CRITICAL findings fail closed immediately regardless of LLM output",
      "Gemini security gate returns a schema-validated verdict (APPROVE, NEEDS_REVIEW, REJECT)",
      "Sensitive credentials or malicious patches are blocked before verification or agent handback",
    ],
    payloadTitle: "SecurityGateService.inspectSubmission",
    payloadCode: `{
  "service": "SecurityGateService.inspectSubmission",
  "verdict": "APPROVE",
  "riskLevel": "LOW",
  "deterministic": { "verdict": "CLEAN", "findingCount": 0 },
  "gemini": {
    "model": "gemini-2.5-flash",
    "verdict": "APPROVE",
    "confidence": 0.96
  }
}`,
  },
  {
    number: "07",
    tabLabel: "Step 7 — Independent verification",
    title: "Isolated Verification Runner & Acceptance Checklist",
    phase: "Verification & Execution",
    actor: "IsolatedExecutionRunner + VerificationEngine",
    endpoint: "GET /api/v1/tasks/:id",
    description:
      "An independent verification engine checks textual and structural coverage of every acceptance criterion and executes submitted code inside an isolated runner with outbound network disabled, memory caps, and strict timeouts.",
    invariants: [
      "Specialists can never self-approve or verify their own submissions",
      "Isolated execution enforces networkAccess='DISABLED', memory cap, and timeout bounds",
      "Soft risk flags route to NEEDS_MANUAL_REVIEW for explicit requester sign-off",
    ],
    payloadTitle: "Isolated Verification Run Record",
    payloadCode: `{
  "verificationStatus": "PASSED",
  "checksPassed": 6,
  "checksFailed": 0,
  "executionSummary": {
    "verdict": "PASS",
    "exitCode": 0,
    "durationMs": 142,
    "limits": { "networkAccess": "DISABLED", "maxMemoryMb": 128 }
  }
}`,
  },
  {
    number: "08",
    tabLabel: "Step 8 — AI resumes",
    title: "Signed Agent Handback (X-TrustToPay-Signature) & Session Resumption",
    phase: "Trusted Resumption",
    actor: "AgentHandbackService + SessionController",
    endpoint: "GET /api/v1/tasks/:id/handback + POST /api/v1/sessions/:id/resume",
    description:
      "Once verified, TrustToPay generates an idempotent agent handback payload containing the verified answer, immutable artifact SHA-256 digest, and an HMAC-SHA256 signature header so the AI agent can resume execution with cryptographic proof.",
    invariants: [
      "Signed with X-TrustToPay-Signature (t=<timestamp>,v1=<hmac_sha256>) to prevent tampering",
      "Verified deliverable is preserved for the agent even if a downstream payout requires reconciliation",
      "Idempotency key guarantees safe replay across agent retries",
    ],
    payloadTitle: "Signed Agent Handback Header & Payload",
    payloadCode: `X-TrustToPay-Signature: t=1730284012,v1=5a92f8c3d104e71b92a64c8f10e3b7d2
{
  "taskId": "task_84c1",
  "status": "HANDED_OFF",
  "handoffIdempotencyKey": "handoff_task_84c1_v1",
  "artifact": {
    "version": 1,
    "sha256Digest": "8f94d2c1b7e04a319c5d7e8b1204f9a3d6c8e1b2a4f09c3d8e7b6a5f4c3b2a10"
  }
}`,
  },
  {
    number: "09",
    tabLabel: "Step 9 — Payment workflow",
    title: "Decoupled PayPal Orders v2 Capture & Payouts v1 Settlement",
    phase: "Financial Settlement",
    actor: "PayPalPaymentService + Webhook Reconciler",
    endpoint: "POST /api/v1/payments/tasks/:id/payout",
    description:
      "Funding and payout are strictly decoupled. Requesters fund tasks upfront via PayPal Orders v2 capture; specialist rewards are released via PayPal Payouts v1 only after verification passes and payout consent is confirmed.",
    invariants: [
      "Hard-wired to PayPal Sandbox / labelled simulation — live-money endpoints are unreachable",
      "Server verifies captured minor-unit amounts, currency, and webhook signatures",
      "Unknown or failed payout states require explicit reconciliation before retry",
    ],
    payloadTitle: "POST /api/v1/payments/tasks/:id/payout",
    payloadCode: `POST /api/v1/payments/tasks/:id/payout
{
  "paymentId": "pay_902f1a",
  "type": "PAYOUT",
  "provider": "PAYPAL_SANDBOX",
  "payoutBatchId": "BATCH-7741902",
  "amountDisplay": "$25.00",
  "currency": "USD",
  "status": "COMPLETED"
}`,
  },
];

type WorkspacePreviewKey = "requester" | "specialist";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeWorkflowIdx, setActiveWorkflowIdx] = useState(0);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspacePreviewKey>("requester");

  const currentWorkflow = WORKFLOW_STEPS[activeWorkflowIdx];

  return (
    <div className="min-h-dvh bg-[#F7F5EF] text-[#202722]">
      <PublicHeader />

      <main>
        {/* 1A. NEW HERO 22 — ANATOMICAL NEURAL-BRAIN COORDINATION HERO */}
        <Hero22NeuralBrain isAuthenticated={Boolean(user)} />

        {/* 1B. LOCKED EYE-PUPIL HERO SECTION (OriginKit Hero 49 Woven Fibre Arc + OriginKit Hero 51 Eye-Tracking & Readout Deck) */}
        <section
          className="ok-hero-composite border-b border-[#1B273D] pt-10 pb-16 lg:pt-14 lg:pb-20"
          data-originkit-hero="hero-49-hero-51-composite"
        >
          {/* OriginKit Hero 49: Interactive Woven Fibre Arc WebGL Shader Canvas */}
          <FibreArcCanvas
            background="#04070F"
            baseColor="#1B4FD8"
            accentColor="#6FC8FF"
            highlight="#FFFFFF"
            density={26}
            speed={90}
            hover={190}
            reach={24}
            curve={24}
            spread={105}
            thickness={95}
            comb={170}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* OriginKit Hero 49: Directional 90-degree & vertical contrast scrim */}
          <div className="ok-hero-scrim" aria-hidden="true" />

          <div className="container relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl pt-1">
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[#EEF3FF] sm:text-5xl lg:text-[3.45rem]">
                Give your AI agents a human{" "}
                <em className="ok-hero-serif-accent">when they need one.</em>
              </h2>

              {/* OriginKit Hero 51: Interactive Eye-Tracking Display Line with GrinIris 3D Eyeballs in "look" */}
              <p
                className="mt-5 font-display text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-[#EEF3FF]/90 sm:text-3xl"
                aria-label="See where autonomous agents look when confidence drops."
              >
                <span className="text-[#EEF3FF]/50">See where agents </span>
                <span className="inline-flex items-baseline text-[#EEF3FF]">
                  l
                  <GrinIrisEye irisColor="#3B82F6" scleraColor="#F8FAFC" collarColor="#10B981" scale={136} />
                  <GrinIrisEye irisColor="#3B82F6" scleraColor="#F8FAFC" collarColor="#10B981" scale={136} />
                  k
                </span>{" "}
                <span className="text-[#EEF3FF]/50">for verified truth.</span>
              </p>

              <p className="mt-4 font-display text-base font-medium text-[#CBD5E1]">
                AI doesn&apos;t have to solve everything alone.
              </p>

              <p className="mt-2.5 max-w-[62ch] text-sm leading-6 text-[#94A3B8] sm:text-base sm:leading-7">
                When an autonomous agent hits conflicting specifications, ambiguous runtime behavior, or high-risk
                code paths, TrustToPay dispatches the blocker to a verified human specialist, runs deterministic and
                Gemini security gates in isolation, settles escrow via PayPal, and returns a signed handback.
              </p>

              {/* OriginKit Hero 49: Verified Protocol Sources Strip */}
              <div className="ok-hero49-sources mt-8" aria-label="Verified protocol layers">
                <span>Verifies across</span>
                <ul className="flex flex-wrap items-center gap-2 text-xs text-[#CBD5E1]">
                  <li>Elastic Hybrid kNN</li>
                  <li>L1–L3 Skill Gates</li>
                  <li>SHA-256 Artifacts</li>
                  <li>Gemini Code Audit</li>
                  <li>PayPal Orders v2</li>
                  <li>HMAC-SHA256 Handback</li>
                </ul>
              </div>
            </div>

            {/* OriginKit Hero 51: Signature 3-Column Bottom Architectural Deck (.below + .sub + .buttons + .readout dl) */}
            <div className="mt-12 grid items-start gap-8 border-t border-[#EEF3FF]/15 pt-7 lg:grid-cols-[1.15fr_1fr_1.05fr] lg:gap-10">
              {/* Column 1: Hero 51 Editorial Subcopy */}
              <div>
                <p className="max-w-[38ch] text-base leading-7 text-[#EEF3FF]/82">
                  Send an autonomous escalation request when agent confidence drops below threshold. TrustToPay locks
                  the PayPal reward, dispatches top-five verified specialists, and returns a signed code patch.
                </p>
              </div>

              {/* Column 2: Hero 51 Primary Pill CTA + Underlined Protocol Link */}
              <div className="flex flex-col items-start gap-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-full bg-[#EEF3FF] px-6 text-sm font-semibold text-[#04070F] hover:bg-[#6FC8FF] hover:text-[#04070F]"
                  >
                    <Link to={user ? "/app" : "/register"}>
                      {user ? "Open Workspace" : "Get Started"} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-full border-[#1B273D] bg-[#0B101C]/90 px-6 text-sm font-semibold text-[#EEF3FF] hover:border-[#6FC8FF]/50 hover:bg-[#131C2E]"
                  >
                    <a href="#how-it-works">Explore 9-Step Protocol</a>
                  </Button>
                </div>
                <Link
                  to="/app/docs"
                  className="border-b border-[#EEF3FF]/35 pb-0.5 text-sm font-medium text-[#EEF3FF]/85 transition-colors hover:border-[#6FC8FF] hover:text-[#6FC8FF]"
                >
                  Read technical documentation and API specification
                </Link>
              </div>

              {/* Column 3: Hero 51 Live Session Telemetry Readout */}
              <div className="ok-hero51-readout rounded-lg border border-[#1B273D] bg-[#080C16]/85 px-4 py-3.5">
                <div className="mb-2 flex items-center justify-between border-b border-[#1B273D] pb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
                    Protocol Telemetry · Live Gate
                  </span>
                  <span className="text-[11px] font-semibold text-[#10B981]">ACTIVE</span>
                </div>
                <dl className="m-0 space-y-1">
                  <div className="flex justify-between">
                    <dt>Confidence gate</dt>
                    <dd className="text-[#EEF3FF]">0.41 &lt; 0.75 threshold</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Specialist discovery</dt>
                    <dd className="text-[#EEF3FF]">Elastic kNN + PG L1–L3</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Verification runner</dt>
                    <dd className="text-[#EEF3FF]">AST + Gemini · Exit 0</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Settlement &amp; handback</dt>
                    <dd className="text-[#10B981]">PayPal v2 · HMAC-SHA256</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* 2. COMPLETE WORKFLOW EXPLANATION (#how-it-works) */}
        <section id="how-it-works" className="scroll-mt-16 border-b border-[#E5E1D7] bg-[#F7F5EF] py-10 lg:py-14">
          <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#365FEA]">
                Protocol Lifecycle · 9 Deterministic Stages
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#202722] sm:text-3xl">
                How TrustToPay orchestrates AI-to-human delegation
              </h2>
              <p className="mt-2 max-w-[68ch] text-xs leading-relaxed text-[#69736D] sm:text-sm">
                Every task follows a server-enforced state machine. Select any step below to inspect the inputs,
                security invariants, API routes, and structured payloads enforced by the platform.
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.28fr]">
              {/* Left step selector list */}
              <div
                role="tablist"
                aria-label="TrustToPay 9-step workflow"
                className="flex flex-col gap-1"
              >
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isSelected = idx === activeWorkflowIdx;
                  return (
                    <button
                      key={step.tabLabel}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveWorkflowIdx(idx)}
                      className={cn(
                        "group flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border-[#365FEA] bg-[#FFFEFA] text-[#202722] shadow-surface"
                          : "border-[#E5E1D7] bg-[#F0EEE7]/70 text-[#69736D] hover:border-[#D2CDC0] hover:bg-[#FFFEFA] hover:text-[#202722]",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={cn(
                            "font-mono text-xs font-bold tabular-nums",
                            isSelected ? "text-[#365FEA]" : "text-[#69736D]",
                          )}
                        >
                          {step.number}
                        </span>
                        <span className="truncate text-xs font-semibold">{step.tabLabel}</span>
                      </div>
                      <span className="ml-2 shrink-0 font-mono text-[10px] text-[#69736D]">
                        {step.phase}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right synchronized telemetry inspector */}
              <div className="rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-5 shadow-surface lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E1D7] pb-3.5">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#365FEA]">
                      {currentWorkflow.tabLabel}
                    </span>
                    <h3 className="mt-0.5 font-heading text-lg font-bold text-[#202722] sm:text-xl">
                      {currentWorkflow.title}
                    </h3>
                  </div>
                  <code className="rounded border border-[#E5E1D7] bg-[#F0EEE7] px-2.5 py-1 font-mono text-xs text-[#202722]">
                    {currentWorkflow.endpoint}
                  </code>
                </div>

                <p className="mt-3 max-w-[68ch] text-xs leading-relaxed text-[#69736D] sm:text-sm">
                  {currentWorkflow.description}
                </p>

                <div className="mt-4">
                  <p className="font-heading text-xs font-bold text-[#202722]">
                    Enforced Server Invariants
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {currentWorkflow.invariants.map((inv) => (
                      <li key={inv} className="flex items-start gap-2 text-xs leading-5 text-[#202722]">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#438866]" />
                        <span>{inv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-[#E5E1D7] bg-[#F0EEE7] px-3.5 py-2">
                    <span className="font-mono text-[11px] font-semibold text-[#202722]">
                      {currentWorkflow.payloadTitle}
                    </span>
                    <span className="font-mono text-[10px] text-[#69736D]">{currentWorkflow.actor}</span>
                  </div>
                  <pre className="overflow-x-auto rounded-b-lg border border-[#E5E1D7] bg-[#F7F5EF] p-3.5 font-mono text-xs leading-5 text-[#202722]">
                    <code>{currentWorkflow.payloadCode}</code>
                  </pre>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E1D7] pt-3.5">
                  <span className="font-mono text-xs tabular-nums text-[#69736D]">
                    Step {activeWorkflowIdx + 1} of {WORKFLOW_STEPS.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={activeWorkflowIdx === 0}
                      onClick={() => setActiveWorkflowIdx((i) => Math.max(0, i - 1))}
                    >
                      Previous step
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={activeWorkflowIdx === WORKFLOW_STEPS.length - 1}
                      onClick={() => setActiveWorkflowIdx((i) => Math.min(WORKFLOW_STEPS.length - 1, i + 1))}
                    >
                      Next step
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCT & WORKSPACE PREVIEWS (#product) */}
        <section id="product" className="scroll-mt-16 border-b border-[#E5E1D7] bg-[#FFFEFA] py-10 lg:py-14">
          <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#438866]">
                  Role-Specific Workspaces
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#202722] sm:text-3xl">
                  Purpose-built consoles for Requesters and Verified Specialists
                </h2>
                <p className="mt-2 max-w-[66ch] text-xs leading-relaxed text-[#69736D] sm:text-sm">
                  TrustToPay separates agent escalation controls and specialist code &amp; evidence workbenches into
                  dedicated, high-density workspaces.
                </p>
              </div>

              {/* Workspace switcher */}
              <div className="inline-flex flex-wrap gap-1 rounded-lg border border-[#E5E1D7] bg-[#F0EEE7] p-1">
                {[
                  { id: "requester" as const, label: "Requester Console", icon: Bot },
                  { id: "specialist" as const, label: "Specialist Workbench", icon: Code2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeWorkspace === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveWorkspace(tab.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "border border-[#E5E1D7] bg-[#FFFEFA] text-[#202722] shadow-surface"
                          : "border border-transparent text-[#69736D] hover:text-[#202722]",
                      )}
                    >
                      <Icon className="size-3.5 text-[#365FEA]" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Workspace Screen Preview */}
            <div className="mt-6 rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-5 shadow-surface lg:p-6">
              {activeWorkspace === "requester" ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
                  <div className="space-y-3">
                    <h3 className="font-heading text-xl font-bold text-[#202722]">
                      Monitor agent confidence, fund escalations, and verify handbacks
                    </h3>
                    <p className="text-xs leading-relaxed text-[#69736D] sm:text-sm">
                      Submit technical questions or connect autonomous agents via bearer API keys. When an analysis run
                      identifies conflicting specifications, fund a bounded review via PayPal Orders v2 and resume the
                      agent session once independent verification passes.
                    </p>
                    <ul className="space-y-2 pt-1 text-xs text-[#202722]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Deterministic conflict detection &amp; explicit escalation thresholds
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Upfront PayPal Orders v2 reward funding before marketplace dispatch
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Cryptographically signed <code className="font-mono text-[#365FEA]">X-TrustToPay-Signature</code>{" "}
                        agent handback
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Button asChild size="sm">
                        <Link to={user ? "/app/workspace" : "/register"}>
                          Open Agent Workspace <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-4 font-mono text-xs shadow-surface">
                    <div className="flex items-center justify-between border-b border-[#E5E1D7] pb-2.5 text-[11px] text-[#69736D]">
                      <span className="font-semibold text-[#202722]">
                        SESSION · Worker Pool Concurrency &amp; AbortController Timeout
                      </span>
                      <span className="font-bold text-[#B4690E]">ESCALATE_TO_HUMAN</span>
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                      <div className="rounded border border-[#E5E1D7] bg-[#F7F5EF] p-2.5">
                        <p className="text-[10px] text-[#69736D]">CONFIDENCE</p>
                        <p className="mt-0.5 text-base font-bold tabular-nums text-[#B4690E]">41%</p>
                        <p className="text-[10px] text-[#69736D]">Threshold: 75%</p>
                      </div>
                      <div className="rounded border border-[#E5E1D7] bg-[#F7F5EF] p-2.5">
                        <p className="text-[10px] text-[#69736D]">ESCROW FUNDING</p>
                        <p className="mt-0.5 text-base font-bold tabular-nums text-[#438866]">$25.00 USD</p>
                        <p className="text-[10px] text-[#69736D]">PayPal Orders v2</p>
                      </div>
                      <div className="rounded border border-[#E5E1D7] bg-[#F7F5EF] p-2.5">
                        <p className="text-[10px] text-[#69736D]">HANDBACK DIGEST</p>
                        <p className="mt-0.5 truncate text-xs font-bold text-[#365FEA]">sha256:8f94d2c1…</p>
                        <p className="text-[10px] text-[#69736D]">HMAC-SHA256 Signed</p>
                      </div>
                    </div>
                    <div className="mt-2.5 rounded border border-[#E5E1D7] bg-[#F0EEE7]/70 p-2.5 text-[11px] leading-5 text-[#69736D]">
                      <p className="font-semibold text-[#202722]">Critical Conflict Flagged</p>
                      <p className="mt-0.5">
                        Source A (<code className="text-[#202722]">src/worker-pool.ts</code>) configures 4 workers with
                        no request timeout; Source B (<code className="text-[#202722]">runbook.md</code>) requires 12
                        workers and a 30s <code className="text-[#202722]">AbortController</code> bound.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
                  <div className="space-y-3">
                    <h3 className="font-heading text-xl font-bold text-[#202722]">
                      Earn L1–L3 skill badges, claim top-five offers, and submit verified code artifacts
                    </h3>
                    <p className="text-xs leading-relaxed text-[#69736D] sm:text-sm">
                      Specialists unlock sequential Foundation (L1), Practitioner (L2), and Advanced (L3) badges by
                      passing timed technical assessments. Claim funded tasks atomically, upload code files or unified
                      git diffs, and track PayPal Payouts in real time.
                    </p>
                    <ul className="space-y-2 pt-1 text-xs text-[#202722]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Sequential L1 → L2 → L3 skill verification tracks (no self-reported badges)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Top-5 parallel offer wave with atomic first-accept locking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#438866]" />
                        Immutable SHA-256 code artifact &amp; unified git diff submission workbench
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Button asChild size="sm">
                        <Link to={user ? "/app/marketplace" : "/register"}>
                          Explore Specialist Workbench <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-4 font-mono text-xs shadow-surface">
                    <div className="flex items-center justify-between border-b border-[#E5E1D7] pb-2.5 text-[11px] text-[#69736D]">
                      <span className="font-semibold text-[#202722]">SPECIALIST OFFER · Batch #1 · Rank #1 (96 pts)</span>
                      <span className="font-bold tabular-nums text-[#438866]">L3 VERIFIED · $25.00 USD</span>
                    </div>
                    <div className="mt-2.5 rounded border border-[#E5E1D7] bg-[#F7F5EF] p-3">
                      <p className="text-[11px] font-semibold text-[#202722]">
                        Artifact v1 · src/worker-pool.ts (SHA-256: 8f94d2c1b7e04a31…)
                      </p>
                      <pre className="mt-1.5 overflow-x-auto text-[11px] leading-5 text-[#438866]">
                        <code>{`+ const controller = new AbortController();
+ const timer = setTimeout(() => controller.abort(), 30_000);
+ try {
+   return await fetch(job.endpoint, { signal: controller.signal });
+ } finally {
+   clearTimeout(timer);
+ }`}</code>
                      </pre>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded border border-[#E5E1D7] bg-[#F0EEE7]/70 px-3 py-2 text-[11px] text-[#69736D]">
                      <span>Security Gate: CLEAN · Gemini: APPROVE</span>
                      <span className="font-semibold text-[#438866]">Isolated Runner: PASS (Exit 0)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. FOR DEVELOPERS & CRYPTOGRAPHIC HANDBACK (#developers) */}
        <section id="developers" className="scroll-mt-16 border-b border-[#E5E1D7] bg-[#F7F5EF] py-10 lg:py-14">
          <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]">
              <div className="space-y-3.5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#365FEA]">
                  Developer Integration Kit · MCP + Agent Skill + REST
                </p>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-[#202722] sm:text-3xl">
                  Integrate human escalation and signed handbacks in minutes
                </h2>
                <p className="max-w-[65ch] text-xs leading-relaxed text-[#69736D] sm:text-sm">
                  Authenticate autonomous agents with scoped <code className="font-mono text-xs text-[#202722]">ttp_ak_…</code>{" "}
                  bearer keys or connect via the official TrustToPay MCP Server. Verify every human deliverable with{" "}
                  <code className="font-mono text-xs text-[#202722]">X-TrustToPay-Signature</code> before applying
                  patches or resuming execution.
                </p>

                <dl className="space-y-2.5 pt-1">
                  {[
                    {
                      icon: Terminal,
                      title: "Official MCP Server + Open Agent Skill + REST API (/api/v1)",
                      detail: "Connect Claude Code, Cursor, or custom agents via stdio MCP tools or OpenAPI REST endpoints.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Cryptographic Artifact & Handback Integrity",
                      detail: "Canonical SHA-256 digests over submitted files and unified diffs, signed with HMAC-SHA256.",
                    },
                    {
                      icon: Database,
                      title: "Elastic Hybrid Search with Relational Fallback",
                      detail: "Uses @elastic/elasticsearch for semantic + keyword specialist retrieval while preserving DB constraints.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3.5 shadow-surface"
                      >
                        <Icon className="mt-0.5 size-4 shrink-0 text-[#365FEA]" />
                        <div>
                          <dt className="font-heading text-xs font-bold text-[#202722]">{item.title}</dt>
                          <dd className="mt-0.5 text-xs leading-5 text-[#69736D]">{item.detail}</dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <Button asChild variant="outline">
                    <Link to="/app/docs">
                      Read Technical Documentation <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <a href="/api-docs" target="_blank" rel="noreferrer">
                      OpenAPI / Swagger Spec
                    </a>
                  </Button>
                </div>
              </div>

              {/* Developer code integration preview */}
              <div className="overflow-hidden rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] shadow-surface">
                <div className="flex items-center justify-between border-b border-[#E5E1D7] bg-[#F0EEE7] px-4 py-2.5 font-mono text-xs text-[#202722]">
                  <span className="font-semibold">verify-handback.ts</span>
                  <span className="font-semibold text-[#438866]">HMAC-SHA256</span>
                </div>
                <pre className="overflow-x-auto bg-[#FFFEFA] p-4 font-mono text-xs leading-6 text-[#202722]">
                  <code>{`import crypto from "node:crypto";

// 1. Fetch the verified specialist handback payload
const res = await fetch(\`https://trusttopay.internal/api/v1/tasks/\${taskId}/handback\`, {
  headers: { Authorization: \`Bearer \${process.env.TTP_AGENT_API_KEY}\` },
});

const signatureHeader = res.headers.get("x-trusttopay-signature") ?? "";
const rawBody = await res.text();

// 2. Verify X-TrustToPay-Signature (t=<timestamp>,v1=<hmac>)
const [tPart, v1Part] = signatureHeader.split(",");
const timestamp = tPart.replace("t=", "");
const expectedHmac = crypto
  .createHmac("sha256", process.env.TTP_HANDBACK_SECRET!)
  .update(\`\${timestamp}.\${rawBody}\`)
  .digest("hex");

if (!crypto.timingSafeEqual(Buffer.from(v1Part.replace("v1=", "")), Buffer.from(expectedHmac))) {
  throw new Error("Untrusted handback signature");
}

// 3. Apply verified artifact & resume agent session
const { handback } = JSON.parse(rawBody);
console.log("Verified artifact SHA-256:", handback.artifact.sha256Digest);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONVERSION SECTION */}
        <section className="bg-[#F7F5EF] py-10 lg:py-12">
          <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-6 shadow-surface sm:flex-row sm:items-center lg:p-8">
              <div className="max-w-xl">
                <h2 className="font-heading text-xl font-bold tracking-tight text-[#202722] sm:text-2xl">
                  Start orchestrating verified human escalations for your AI agents.
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-[#69736D] sm:text-sm">
                  Create a requester or specialist account, inspect the live verification and payment ledger, or review
                  the system architecture documentation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button asChild size="lg">
                  <Link to={user ? "/app" : "/register"}>
                    {user ? "Go to Workspace" : "Create Account"} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Sign In</Link>
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
