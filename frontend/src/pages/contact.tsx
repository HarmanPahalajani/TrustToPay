import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Bug, Lock, ShieldAlert } from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#141B2D]">
            Support &amp; Security Disclosure
          </h1>
          <p className="text-[15px] leading-6 text-[#4E596E]">
            Guidance for integration support, issue reporting, and responsible vulnerability disclosure.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-[#4263EB]" /> API &amp; MCP reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#4E596E]">
              <p>
                Review setup guides for the REST API, Agent Skill, and the four TrustToPay MCP tools in the
                documentation center.
              </p>
              <Button asChild size="default" variant="outline">
                <Link to="/app/docs">
                  <BookOpen className="size-4" /> Open Developer Docs
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bug className="size-4 text-[#4263EB]" /> Reporting product issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-[#4E596E]">
              <p>
                Include the task ID, the page or API route involved, and the error message shown in the workspace.
                Remove any tokens or personal credentials before sharing logs or screenshots.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#F5A623]/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#9A6100]">
                <ShieldAlert className="size-4 text-[#D48806]" /> Security disclosure policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#4E596E]">
              <p>
                Never post active tokens, passwords, or exploit payloads publicly. Report potential security findings
                privately with clear reproduction steps.
              </p>
              <div className="flex items-start gap-2.5 rounded-lg bg-[#F5A623]/[0.09] p-3 text-xs leading-5 text-[#141B2D]">
                <Lock className="mt-0.5 size-4 shrink-0 text-[#9A6100]" />
                <span>Always redact API keys, session cookies, and private credentials before sharing reports.</span>
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
