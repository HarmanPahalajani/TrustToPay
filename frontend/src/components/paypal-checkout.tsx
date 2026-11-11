import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, CheckCircle2, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PayPalLogo } from "@/components/partner-logos";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, unknown>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
      }) => {
        render: (selectorOrEl: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

export function PayPalCheckoutCard({
  taskId,
  amount: _amount,
  amountDisplay,
  currency,
  clientId,
  enabled,
  onCompleted,
  label,
}: {
  taskId: string;
  amount?: number;
  amountDisplay: string;
  currency: string;
  clientId?: string | null;
  enabled?: boolean;
  onCompleted: () => void | Promise<void>;
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const integrationQuery = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 60_000,
    enabled: enabled === undefined || clientId === undefined,
  });

  const resolvedEnabled =
    enabled !== undefined
      ? enabled
      : Boolean(
          integrationQuery.data?.paypal.configured &&
            integrationQuery.data?.paypal.paymentsMode === "SANDBOX",
        );
  const resolvedClientId =
    clientId !== undefined ? clientId : (integrationQuery.data?.paypal.clientId ?? null);

  useEffect(() => {
    if (!resolvedEnabled || !resolvedClientId) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
    if (existing && window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      resolvedClientId,
    )}&currency=${encodeURIComponent(currency || "USD")}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => setSdkReady(true);
    script.onerror = () =>
      setSdkError("Could not load PayPal JavaScript SDK. Use direct sandbox capture below.");
    document.body.appendChild(script);
  }, [resolvedEnabled, resolvedClientId, currency]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;
    containerRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: {
        layout: "horizontal",
        color: "gold",
        shape: "rect",
        height: 40,
        tagline: false,
      },
      createOrder: async () => {
        setSdkError(null);
        const res = await api.payments.createOrder(taskId);
        return res.paypal.orderId || "";
      },
      onApprove: async (data) => {
        setBusy(true);
        try {
          await api.payments.capture(data.orderID);
          setMessage("PayPal Sandbox order captured and verified.");
          await onCompleted();
        } finally {
          setBusy(false);
        }
      },
      onError: (err) => {
        setSdkError(err instanceof Error ? err.message : "PayPal widget encountered an error.");
      },
    });

    buttons.render(containerRef.current).catch(() => {
      setSdkError("PayPal Buttons could not initialize in this frame.");
    });
  }, [sdkReady, taskId, onCompleted]);

  async function handleServerSideFlow() {
    setBusy(true);
    setSdkError(null);
    setMessage(null);
    try {
      const order = await api.payments.createOrder(taskId);
      if (order.paypal.orderId) {
        await api.payments.capture(order.paypal.orderId);
      }
      setMessage(`Order captured (${order.paypal.mode}).`);
      await onCompleted();
    } catch (error) {
      setSdkError(error instanceof Error ? error.message : "Payment execution failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E9F2] pb-3">
        <div className="flex items-center gap-2.5">
          <PayPalLogo className="h-5" />
          <span className="text-xs font-semibold text-[#141B2D]">
            {label || "Escrow Funding Checkout"}
          </span>
        </div>
        <span className="font-mono text-xs font-bold text-[#141B2D] tabular-nums">
          {amountDisplay} {currency}
        </span>
      </div>

      {resolvedEnabled && resolvedClientId ? (
        <div className="space-y-2">
          <div ref={containerRef} className="min-h-[42px]" />
          {!sdkReady && !sdkError ? (
            <div className="text-[11px] text-[#68738A]">Initializing PayPal Sandbox Buttons…</div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E4E9F2] bg-[#F5F7FC] p-3">
        <p className="min-w-0 flex-1 text-xs leading-5 text-[#4E596E]">
          {resolvedEnabled
            ? "Creates a PayPal Sandbox Order v2 and records verified funding into the task ledger."
            : "Demo mode: creates and captures a labelled simulated funding order in the task ledger."}
        </p>
        <Button size="sm" variant="default" loading={busy} onClick={handleServerSideFlow}>
          <CreditCard className="size-3.5" />
          {resolvedEnabled ? "Capture Sandbox Order" : "Simulate Escrow Funding"}
        </Button>
      </div>

      {sdkError ? <Alert tone="danger">{sdkError}</Alert> : null}

      {message ? (
        <Alert tone="success" icon={<CheckCircle2 className="size-4 text-[#12A875]" />}>
          {message}
        </Alert>
      ) : null}

      <div className="flex items-center gap-1.5 text-[11px] text-[#68738A]">
        <Lock className="size-3.5 shrink-0 text-[#4263EB]" />
        <span>
          {resolvedEnabled
            ? "PayPal Sandbox Environment · No real funds are charged."
            : "Deterministic Local Escrow · Labelled as Simulated."}
        </span>
      </div>
    </div>
  );
}

export const PayPalCheckout = PayPalCheckoutCard;
