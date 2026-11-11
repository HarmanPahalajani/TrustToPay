import { Link } from "react-router-dom";
import { ArrowLeft, Database, Lock, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { PublicHeader, MarketingFooter } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#F7F5EF] text-[#202722]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#202722]">
            Privacy &amp; Data Handling
          </h1>
          <p className="text-[15px] leading-6 text-[#444D47]">
            How TrustToPay handles account records, submitted work, safety checks, and payment records.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#202722]">
                <Database className="size-4 text-[#365FEA]" /> Information stored on the platform
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-[#444D47]">
                <li>Account profile details: name, email address, account role, and verified skill levels.</li>
                <li>Task requests: task descriptions, requirements, attached notes, and completion guidelines.</li>
                <li>Specialist work: submitted answers, explanations, attached files, and review history.</li>
                <li>Payment records: PayPal payment references, currency, amounts, and task status updates.</li>
              </ul>
              <p className="text-sm leading-6 text-[#69736D]">
                Payment card numbers and bank details are never collected or stored by TrustToPay. PayPal handles
                the checkout experience directly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#202722]">
                <Lock className="size-4 text-[#365FEA]" /> Sign-in and account security
              </h2>
              <p className="text-sm leading-6 text-[#444D47]">
                Your sign-in session is protected with industry-standard encryption. TrustToPay does not run
                third-party advertising trackers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#202722]">
                <Trash2 className="size-4 text-[#365FEA]" /> Safe content guidelines
              </h2>
              <p className="text-sm leading-6 text-[#444D47]">
                Do not upload passwords, private access keys, or sensitive personal financial data inside task
                descriptions or attached files.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#202722]">
                <ShieldCheck className="size-4 text-[#438866]" /> Trusted service partners
              </h2>
              <p className="text-sm leading-6 text-[#444D47]">
                PayPal handles checkout and payouts, while automated specialist matching and AI safety checks help verify
                completed work before delivery.
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
