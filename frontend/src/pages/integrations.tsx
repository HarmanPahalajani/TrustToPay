import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  CreditCard,
  Database,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, DataRow } from "@/components/common";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate } from "@/lib/format";

export default function IntegrationsPage() {
  const query = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 30_000,
  });

  if (query.isLoading) return <LoadingBlock label="Checking service status…" />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={(query.error as Error)?.message ?? "Service status is unavailable."}
        onRetry={() => query.refetch()}
      />
    );
  }

  const status = query.data;
  const { paypal, ai } = status;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform service status"
        description="Live health and readiness for AI analysis, task verification, and PayPal payment processing."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/docs">
                API &amp; MCP Docs <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <Button variant="outline" onClick={() => query.refetch()} loading={query.isFetching}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusTile
          icon={<Bot className="size-4" />}
          label="AI analysis"
          value={ai.engine === "demo" ? "Practice mode" : "Active"}
          detail={ai.engine === "demo" ? "Built-in analysis rules active" : `${ai.provider} · ${ai.model}`}
          tone={ai.engine === "demo" ? "info" : "success"}
        />
        <StatusTile
          icon={<CreditCard className="size-4" />}
          label="Task funding"
          value={paypal.paymentsMode === "SIMULATED" ? "Practice mode" : "PayPal test mode"}
          detail={
            paypal.paymentsMode === "SIMULATED"
              ? "Test payment — no real money will be charged"
              : "PayPal test checkout ready"
          }
          tone={paypal.paymentsMode === "SIMULATED" ? "warning" : "success"}
        />
        <StatusTile
          icon={<Wallet className="size-4" />}
          label="Specialist payouts"
          value={paypal.payoutsEnabled ? "Available" : "Restricted"}
          detail={
            paypal.payoutsEnabled
              ? "Verified specialist rewards can be released"
              : "Task funding works; payouts disabled on merchant account"
          }
          tone={paypal.payoutsEnabled ? "success" : "neutral"}
        />
      </div>

      {status.issues.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldAlert className="size-4 text-[#9A6100]" /> Service notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {status.issues.map((issue) => (
              <Alert
                key={issue.code}
                tone={issue.level === "error" ? "danger" : issue.level === "warning" ? "warning" : "info"}
                title={issue.message}
              >
                {issue.hint ? <p>{issue.hint}</p> : null}
              </Alert>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-[#E4E9F2] pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4 text-[#4263EB]" /> Payment processing
              </CardTitle>
              <Badge tone={paypal.checkoutReady ? "success" : "danger"} dot>
                {paypal.checkoutReady ? "Ready" : "Unavailable"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <dl>
              <DataRow label="Payment mode">
                {paypal.paymentsMode === "SIMULATED" ? "Practice mode" : "PayPal test mode"}
              </DataRow>
              <DataRow label="Checkout status">{paypal.checkoutReady ? "Ready" : "Unavailable"}</DataRow>
              <DataRow label="Payouts status">{paypal.payoutsEnabled ? "Enabled" : "Unavailable"}</DataRow>
              <DataRow label="Currency">{paypal.currency}</DataRow>
              <DataRow label="Reward range">
                {status.rewardLimits.minDisplay} – {status.rewardLimits.maxDisplay}
              </DataRow>
            </dl>
            <p className="rounded-xl bg-[#F5F7FC] p-3.5 text-xs leading-5 text-[#4E596E]">
              Task funding and specialist payouts are handled separately. Even if payouts are temporarily restricted on
              a test merchant account, task escrow and verification continue to run reliably.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-[#E4E9F2] pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#12A875]" /> AI &amp; verification services
              </CardTitle>
              <Badge tone={ai.configured || ai.engine === "demo" ? "success" : "warning"} dot>
                {ai.configured || ai.engine === "demo" ? "Operational" : "Check required"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <dl>
              <DataRow label="Analysis mode">{ai.engine === "demo" ? "Built-in rules" : "AI provider"}</DataRow>
              <DataRow label="Model">{ai.model}</DataRow>
              <DataRow label="Escalation threshold" className="tabular-nums">
                {Math.round(ai.threshold * 100)}%
              </DataRow>
              <DataRow label="Database">
                <span className="inline-flex items-center gap-1.5">
                  <Database className="size-3.5 text-[#12A875]" /> {status.database.label}
                </span>
              </DataRow>
            </dl>
            <p className="rounded-xl bg-[#F5F7FC] p-3.5 text-xs leading-5 text-[#4E596E]">
              Submitted specialist work is verified automatically against task requirements and security checks before
              returning a signed result to the requesting agent.
            </p>
          </CardContent>
        </Card>
      </div>

      {status.paypal.paymentsMode === "SIMULATED" ? (
        <Alert tone="info" title="Practice payment mode is active">
          Test payment entries in this workspace never charge real money.
        </Alert>
      ) : status.paypal.configured ? (
        <Alert tone="success" icon={<CheckCircle2 className="size-4" />} title="PayPal test mode is active">
          Payments use PayPal&apos;s test environment. No real money is ever transferred.
        </Alert>
      ) : null}

      <p className="text-xs text-[#68738A] tabular-nums">
        Last checked {formatDate(new Date().toISOString())}
      </p>
    </div>
  );
}

function StatusTile({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: "info" | "success" | "warning" | "neutral";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#68738A]">{label}</p>
          <p className="mt-1.5 font-heading text-lg font-bold text-[#141B2D]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[#68738A]">{detail}</p>
        </div>
        <div className="rounded-lg bg-[#F5F7FC] p-2.5 text-[#4E596E]">{icon}</div>
      </div>
      <Badge tone={tone} dot className="mt-3">
        {tone === "success" ? "Healthy" : tone === "warning" ? "Practice mode" : "Status"}
      </Badge>
    </Card>
  );
}
