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
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#141B2D]">
            Privacy &amp; Data Handling
          </h1>
          <p className="text-[15px] leading-6 text-[#4E596E]">
            How TrustToPay handles account records, submitted work, security checks, and payment references.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#141B2D]">
                <Database className="size-4 text-[#4263EB]" /> Information stored on the platform
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#4E596E]">
                <li>Account profile details: name, email address, account role, and verified skill levels.</li>
                <li>Task requests: questions, requirements, attached context files, and acceptance criteria.</li>
                <li>Specialist submissions: uploaded code or explanations, file integrity checks, and review history.</li>
                <li>Payment records: PayPal test order references, currency, amounts, and task status updates.</li>
              </ul>
              <p className="text-sm leading-6 text-[#68738A]">
                Payment card numbers and bank credentials are never collected or stored by TrustToPay. PayPal handles
                the checkout experience directly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#141B2D]">
                <Lock className="size-4 text-[#4263EB]" /> Sign-in and session security
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                Authentication uses secure Supabase sign-in flows and protected server-signed session cookies. TrustToPay
                does not run third-party advertising trackers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#141B2D]">
                <Trash2 className="size-4 text-[#4263EB]" /> Safe content guidelines
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                Do not upload production passwords, private API keys, or regulated personal financial data inside task
                descriptions or attached code artifacts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#141B2D]">
                <ShieldCheck className="size-4 text-[#12A875]" /> Connected platform services
              </h2>
              <p className="text-sm leading-6 text-[#4E596E]">
                PayPal powers checkout, Jina AI and Elasticsearch match task needs with specialist skills, and Google
                Gemini assists with security inspection before verified work returns.
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
                <Mail className="size-4" /> Support &amp; Security
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
