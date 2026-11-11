import { Link } from "react-router-dom";
import { ArrowLeft, Database, Lock, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
          Data Governance &amp; Privacy
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141B2D]">
          Privacy &amp; Data Handling Notice
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#68738A]">
          This notice documents the data models, session credentials, and external provider payloads processed by the
          TrustToPay platform during operation.
        </p>

        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#141B2D]">
                <Database className="size-4 text-[#4263EB]" /> Data stored by the platform
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#4E596E]">
                <li>Account records: name, email, role, authentication claims, specialist certification levels, and profile metadata.</li>
                <li>Specialist payout profile: PayPal Sandbox recipient email, explicit consent flag, and provider type.</li>
                <li>Agent sessions: technical prompts, system specifications, supplied evidence documents, and structured analysis runs.</li>
                <li>Escalated tasks: acceptance criteria, immutable SHA-256 code artifacts, submissions, verification checklists, security scan reports, and timeline events.</li>
                <li>Payment ledger metadata: local transaction IDs, PayPal order/batch identifiers, minor-unit amounts, currencies, statuses, and reconciliation logs.</li>
              </ul>
              <p className="text-sm leading-6 text-[#68738A]">
                Payment card numbers and bank credentials are never collected or stored by TrustToPay. In PayPal Sandbox
                mode, PayPal hosts the checkout flow and the server records only the order and payout batch references
                required for reconciliation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#141B2D]">
                <Lock className="size-4 text-[#4263EB]" /> Authentication &amp; session storage
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                TrustToPay authenticates requests via Supabase PKCE tokens or server-signed session cookies backed by{" "}
                <code className="rounded bg-[#EDF0F6] px-1.5 py-0.5 font-mono text-xs text-[#141B2D]">httpOnly</code>{" "}
                storage. The platform does not load third-party advertising trackers or behavioral analytics. The official
                PayPal JS SDK loads only on demand when a PayPal Sandbox checkout dialog is opened.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#141B2D]">
                <Trash2 className="size-4 text-[#4263EB]" /> Retention &amp; environment isolation
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                Application records persist in the PostgreSQL database configured by{" "}
                <code className="rounded bg-[#EDF0F6] px-1.5 py-0.5 font-mono text-xs text-[#141B2D]">DATABASE_URL</code>.
                Do not submit live production secrets, regulated personal data, or live financial credentials into a
                Sandbox or evaluation deployment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#141B2D]">
                <ShieldCheck className="size-4 text-[#12A875]" /> External service integrations
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                When PayPal Sandbox mode is enabled, order creation, order capture, and payout batch calls communicate
                only with PayPal Sandbox endpoints. Jina AI and Elasticsearch process non-sensitive skill and task
                summaries for specialist matching, and Google Gemini inspects submitted deliverables within bounded
                verification prompts.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="size-4" /> Back to home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">
                <Mail className="size-4" /> Support &amp; Security Ops
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
