import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Bug,
  Lock,
  Plug,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4263EB]">
          Support &amp; Security Operations
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#141B2D]">
          Operational diagnostics &amp; security disclosure
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#68738A]">
          Use the resources below to inspect live integration telemetry, troubleshoot environment configuration, and
          follow safe security disclosure practices.
        </p>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Terminal className="size-4 text-[#4263EB]" /> Environment &amp; integration diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#4E596E]">
              <p>
                Check live health and integration configuration status in the console. Most deployment issues stem from
                missing environment variables, Supabase redirect allow-lists, or unconfigured PayPal Sandbox
                credentials.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/docs">
                    <BookOpen className="size-3.5" /> Read technical docs
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/integrations">
                    <Plug className="size-3.5" /> Integration status
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="size-4 text-[#4263EB]" /> Issue reporting guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#4E596E]">
              <p>
                When filing an engineering issue, include the exact API route or MCP tool name, the active payment mode (
                <code className="rounded bg-[#EDF0F6] px-1.5 py-0.5 font-mono text-xs text-[#141B2D]">SIMULATED</code>{" "}
                or <code className="rounded bg-[#EDF0F6] px-1.5 py-0.5 font-mono text-xs text-[#141B2D]">SANDBOX</code>
                ), and the structured error code. Always redact bearer tokens, API keys, and PayPal secrets before
                sharing logs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#F5A623]/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-[#9A6100]">
                <ShieldAlert className="size-4 text-[#D48806]" /> Security disclosure policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#4E596E]">
              <p>
                Never open a public issue containing active credentials, session tokens, or exploit payloads against a
                hosted environment. Route vulnerability reports privately to the deployment operator with a minimal
                reproduction.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-[#F5A623]/35 bg-[#F5A623]/[0.08] p-3 text-xs leading-5 text-[#141B2D]">
                <Lock className="mt-0.5 size-4 shrink-0 text-[#D48806]" />
                <span>Never transmit API secrets, PayPal credentials, or session tokens in screenshots or issue comments.</span>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="size-4" /> Back to home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
