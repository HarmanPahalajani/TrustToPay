import { useQuery } from "@tanstack/react-query";
import { FlaskConical, ShieldCheck, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { PayoutAvailabilityBadge } from "@/components/status-badges";

export function PaymentModeBanner({ compact = false }: { compact?: boolean }) {
  const { data } = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 60_000,
  });
  if (!data) return null;

  const { paypal } = data;
  const availability =
    paypal.payoutAvailability ??
    (paypal.paymentsMode === "SIMULATED"
      ? "DEMO_SIMULATED"
      : paypal.configured && paypal.payoutsEnabled
        ? "SANDBOX_ENABLED"
        : "PAYOUT_UNAVAILABLE");

  if (paypal.paymentsMode === "SIMULATED") {
    return (
      <Alert
        tone="warning"
        icon={<FlaskConical className="size-4 text-[#D48806]" />}
        className={compact ? "py-2.5 text-[11px]" : "text-xs"}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#141B2D]">Demo payment mode (SIMULATED).</span>
          <PayoutAvailabilityBadge availability={availability} />
          <span className="text-[#4E596E]">
            No real or PayPal funds move. Set DEMO_MODE=false with Sandbox credentials to run live Sandbox API calls.
          </span>
        </div>
      </Alert>
    );
  }

  if (paypal.configured) {
    return (
      <Alert
        tone="info"
        icon={<ShieldCheck className="size-4 text-[#4263EB]" />}
        className={compact ? "py-2.5 text-[11px]" : "text-xs"}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#141B2D]">PayPal Sandbox mode active.</span>
          <PayoutAvailabilityBadge availability={availability} />
          <span className="text-[#4E596E]">
            Checkout {paypal.payoutsEnabled ? "and Payouts are" : "is"} enabled.
            {paypal.payoutsEnabled
              ? " Only Sandbox test funds are used."
              : " Indian merchant Sandbox accounts support Orders v2 checkout, while Payouts requires separate regional approval."}
          </span>
        </div>
      </Alert>
    );
  }

  return (
    <Alert
      tone="warning"
      icon={<AlertTriangle className="size-4 text-[#D48806]" />}
      className={compact ? "py-2.5 text-[11px]" : "text-xs"}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[#141B2D]">PayPal Sandbox requested but not configured.</span>
        <PayoutAvailabilityBadge availability={availability} />
        <span className="text-[#4E596E]">
          Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET or set DEMO_MODE=true for labelled simulated settlement.
        </span>
      </div>
    </Alert>
  );
}
