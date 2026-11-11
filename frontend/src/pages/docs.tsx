import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  CreditCard,
  ExternalLink,
  Lock,
  Plug,
  Server,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/common";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "How it works", icon: Workflow },
  { id: "mcp", label: "MCP Server", icon: Terminal },
  { id: "rest", label: "REST API", icon: Server },
  { id: "skill", label: "Agent Skill", icon: Bot },
  { id: "paypal", label: "PayPal Escrow", icon: CreditCard },
  { id: "security", label: "Security & Signing", icon: Lock },
];

const MCP_TOOLS = [
  {
    name: "trusttopay_create_task",
    summary: "Escalate a blocked AI task to verified human specialists with acceptance criteria, evidence, and reward budget.",
    inputs: "title, question, category, acceptanceCriteria, rewardAmountUsd, requiredSkills?",
  },
  {
    name: "trusttopay_get_task_status",
    summary: "Check live workflow state, offer acceptance, funding progress, and verification run status for a task.",
    inputs: "taskId",
  },
  {
    name: "trusttopay_get_verified_result",
    summary: "Retrieve the completed specialist submission, verification summary, and HMAC-signed handback payload.",
    inputs: "taskId",
  },
  {
    name: "trusttopay_cancel_task",
    summary: "Cancel a pending or awaiting-funding task before specialist acceptance.",
    inputs: "taskId, reason?",
  },
];

const API_ROUTES = [
  {
    area: "Authentication",
    routes: "POST /auth/login, /auth/register, /auth/logout · GET /auth/me",
  },
  {
    area: "Agent Sessions",
    routes: "POST/GET /sessions · GET /sessions/:id · POST /sessions/:id/analyze, /sessions/:id/resume",
  },
  {
    area: "Tasks & Offers",
    routes: "POST/GET /tasks · GET /tasks/:id · POST /tasks/:id/offers/dispatch, /offers/accept, /offers/decline",
  },
  {
    area: "Submissions & Verification",
    routes: "POST /tasks/:id/accept, /submit, /verify · GET /tasks/:id/handback · POST /tasks/:id/cancel, /disputes",
  },
  {
    area: "Payments & Webhooks",
    routes: "POST /payments/paypal/orders, /orders/:id/capture, /payouts · GET /payments · POST /webhooks/paypal",
  },
  {
    area: "Skills",
    routes: "GET /skills, /skills/taxonomy, /skills/selected · POST /skills/attempts, /skills/attempts/:id/submit",
  },
];

const MCP_CONFIG_SNIPPET = `{
  "mcpServers": {
    "trusttopay": {
      "command": "npx",
      "args": ["-y", "@trusttopay/mcp-server"],
      "env": {
        "TRUSTTOPAY_API_URL": "https://your-trusttopay-api.example.com",
        "TRUSTTOPAY_API_KEY": "your-agent-token"
      }
    }
  }
}`;

const HANDBACK_VERIFY_SNIPPET = `import crypto from "node:crypto";

// Verify X-TrustToPay-Signature before resuming an AI agent
const expected = crypto
  .createHmac("sha256", signingSecret)
  .update(JSON.stringify(handbackPayload))
  .digest("hex");

if (!crypto.timingSafeEqual(Buffer.from(signatureHex), Buffer.from(expected))) {
  throw new Error("Invalid TrustToPay handback signature");
}`;

export default function DocsPage() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const sections = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & MCP Documentation"
        description="Connect AI agents to human specialists using the MCP Server, REST API, or reusable Agent Skill."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/api-docs" target="_blank" rel="noreferrer">
                OpenAPI Spec <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/integrations">
                <Plug className="size-4" /> Service status
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[210px_1fr]">
        <nav aria-label="Documentation sections" className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActive(section.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    active === section.id
                      ? "bg-[#4263EB]/10 font-semibold text-[#4263EB]"
                      : "text-[#68738A] hover:bg-[#EDF0F6] hover:text-[#141B2D]",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" /> {section.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="prose-docs min-w-0 max-w-3xl space-y-10">
          <section id="overview" className="scroll-mt-24 space-y-3">
            <h2 className="mt-0 font-heading text-xl font-bold text-[#141B2D]">How TrustToPay works</h2>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              When an AI agent hits low confidence, conflicting technical evidence, or high-risk ambiguity, it delegates
              the blocked subtask to a verified human specialist and resumes only after the returned work passes
              automated quality and security checks.
            </p>
            <div className="not-prose grid gap-3 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">1. Escalate &amp; Fund</CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-5 text-[#4E596E]">
                  Create a task with clear acceptance criteria and evidence links. Reserve the reward through PayPal
                  before notifying matched specialists.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">2. Review &amp; Verify</CardTitle>
                </CardHeader>
                <CardContent className="text-xs leading-5 text-[#4E596E]">
                  Verified specialists complete the work. Automated scanners, Gemini inspection, and verification
                  checks evaluate the deliverable before returning it signed.
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="mcp" className="scroll-mt-24 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="my-0 font-heading text-xl font-bold text-[#141B2D]">MCP Server</h2>
              <Badge tone="cobalt">@trusttopay/mcp-server</Badge>
            </div>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              Connect any MCP-compatible AI coding or workflow client to TrustToPay using the four production MCP tools
              below.
            </p>

            <div className="not-prose space-y-2.5">
              {MCP_TOOLS.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="font-mono text-xs font-semibold text-[#4263EB]">{tool.name}</code>
                    <span className="font-mono text-[11px] text-[#68738A]">{tool.inputs}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#4E596E]">{tool.summary}</p>
                </div>
              ))}
            </div>

            <Card className="not-prose overflow-hidden">
              <CardHeader className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-[#141B2D]">
                  <Code2 className="size-3.5 text-[#4263EB]" /> Example MCP Client Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="overflow-x-auto bg-[#10172A] p-4 font-mono text-xs leading-6 text-[#F5F7FC]">
                  <code>{MCP_CONFIG_SNIPPET}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          <section id="rest" className="scroll-mt-24 space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#141B2D]">REST API Reference</h2>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              All application routes live under <code className="font-mono text-xs">/api/v1</code> and authenticate
              via session cookie or Bearer token. Structured errors use{" "}
              <code className="font-mono text-xs">{`{ error: { code, message, details? } }`}</code>.
            </p>
            <div className="not-prose overflow-x-auto rounded-xl border border-[#E4E9F2] bg-[#FFFFFF]">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead className="border-b border-[#E4E9F2] bg-[#F5F7FC] text-xs font-semibold text-[#68738A]">
                  <tr>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Endpoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F2]">
                  {API_ROUTES.map((row) => (
                    <tr key={row.area}>
                      <td className="whitespace-nowrap px-4 py-3 align-top font-semibold text-[#141B2D]">
                        {row.area}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs leading-5 text-[#4E596E]">
                        {row.routes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="skill" className="scroll-mt-24 space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#141B2D]">Agent Skill Integration</h2>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              Agents using the TrustToPay skill follow a clear four-step escalation pattern:
            </p>
            <ul className="space-y-1.5 text-sm leading-relaxed text-[#4E596E]">
              <li>Run local analysis first; escalate whenever confidence drops below threshold or evidence conflicts.</li>
              <li>Create a task with specific acceptance criteria via <code className="font-mono text-xs">trusttopay_create_task</code>.</li>
              <li>Poll task state cleanly via <code className="font-mono text-xs">trusttopay_get_task_status</code> until verification completes.</li>
              <li>Retrieve and verify the signed result with <code className="font-mono text-xs">trusttopay_get_verified_result</code> before resuming execution.</li>
            </ul>
          </section>

          <section id="paypal" className="scroll-mt-24 space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#141B2D]">PayPal Escrow &amp; Payouts</h2>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              Task funding and specialist payouts are separate lifecycle events. Funding locks the reward before a
              specialist accepts the task; payouts become eligible only after automated security checks and task
              verification pass.
            </p>
            <div className="not-prose grid gap-3 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CreditCard className="size-4 text-[#4263EB]" /> Funding checkout
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs leading-5 text-[#4E596E]">
                  <p>Uses PayPal Orders v2 capture with server-side validation of task amount and currency.</p>
                  <p>Test payment — no real money will be charged in this environment.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="size-4 text-[#12A875]" /> Payouts &amp; safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs leading-5 text-[#4E596E]">
                  <p>Requires specialist PayPal email, recorded payout consent, and passing verification.</p>
                  <p>If payouts are unavailable on the merchant account, verified work stays safely recorded.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="security" className="scroll-mt-24 space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#141B2D]">Security &amp; Signed Handback</h2>
            <p className="text-sm leading-relaxed text-[#4E596E]">
              Every verified deliverable receives a <code className="font-mono text-xs">SHA-256</code> file integrity
              digest and an <code className="font-mono text-xs">HMAC-SHA256</code> signature header (
              <code className="font-mono text-xs">X-TrustToPay-Signature</code>) so agents never consume tampered results.
            </p>
            <Card className="not-prose overflow-hidden">
              <CardHeader className="border-b border-[#E4E9F2] bg-[#F5F7FC] py-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-[#141B2D]">
                  <Lock className="size-3.5 text-[#12A875]" /> Verifying X-TrustToPay-Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="overflow-x-auto bg-[#10172A] p-4 font-mono text-xs leading-6 text-[#F5F7FC]">
                  <code>{HANDBACK_VERIFY_SNIPPET}</code>
                </pre>
              </CardContent>
            </Card>
            <Alert tone="info">
              Specialists cannot verify their own submissions, and suspicious files are stopped by automated security
              scanners and Gemini inspection before an agent resumes.
            </Alert>
          </section>

          <div className="not-prose mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FFFFFF] border border-[#E4E9F2] p-4">
            <div className="flex items-start gap-2 text-xs leading-5 text-[#4E596E]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
              <span>Ready to test an AI escalation flow end to end?</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/app/workspace">Open Agent Workspace</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/">
                  Back to overview <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
