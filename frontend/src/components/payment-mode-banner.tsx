import { useQuery } from "@tanstack/react-query";
import { Info, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Alert } from "@/components/ui/alert";

export function PaymentModeBanner({ compact = false }: { compact?: boolean }) {
  const { data } = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 60_000,
  });
  if (!data) return null;

  const { paypal } = data;

  if (paypal.paymentsMode === "SANDBOX" && paypal.configured) {
    return (
      <Alert
        tone="info"
        icon={<ShieldCheck className="size-4 text-[#4263EB]" />}
        className={compact ? "py-2.5 text-xs" : "text-[13px]"}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[#141B2D]">PayPal test payment active.</span>
          <span className="text-[#4E596E]">Test payment — no real money will be charged.</span>
        </div>
      </Alert>
    );
  }

  if (paypal.paymentsMode === "SIMULATED") {
    return (
      <Alert
        tone="info"
        icon={<Info className="size-4 text-[#4263EB]" />}
        className={compact ? "py-2.5 text-xs" : "text-[13px]"}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[#141B2D]">Practice payment mode.</span>
          <span className="text-[#4E596E]">Test payment — no real money will be charged.</span>
        </div>
      </Alert>
    );
  }

  return null;
}
