import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Bug, Lock, ShieldAlert } from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-[#F7F5EF] text-[#202722]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#202722]">
            Support &amp; Security Disclosure
          </h1>
          <p className="text-[15px] leading-6 text-[#444D47]">
            Help with your account, reporting product issues, and sharing security concerns safely.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#202722]">
                <BookOpen className="size-4 text-[#365FEA]" /> Developer documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#444D47]">
              <p>
                Building an automated integration? View the technical reference guides in Developer Docs.
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
              <CardTitle className="flex items-center gap-2 text-base text-[#202722]">
                <Bug className="size-4 text-[#365FEA]" /> Reporting product issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-[#444D47]">
              <p>
                Include the task title, the page where the problem happened, and the message shown on screen.
                Remove any passwords or personal details before sharing screenshots.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#C97A2E]/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#94581F]">
                <ShieldAlert className="size-4 text-[#C97A2E]" /> Security disclosure policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-[#444D47]">
              <p>
                Never post passwords or sensitive account details publicly. Report potential security concerns
                privately with clear steps to reproduce the issue.
              </p>
              <div className="flex items-start gap-2.5 rounded-lg bg-[#C97A2E]/[0.09] p-3 text-xs leading-5 text-[#202722]">
                <Lock className="mt-0.5 size-4 shrink-0 text-[#94581F]" />
                <span>Always remove private keys, passwords, and personal credentials before sharing reports.</span>
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
