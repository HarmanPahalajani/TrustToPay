import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, unknown>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

export function PayPalCheckoutCard({
  taskId,
  amount,
  amountDisplay,
  currency,
  clientId,
  enabled,
  onCompleted,
  label,
}: {
  taskId: string;
  amount?: number;
  amountDisplay?: string;
  currency?: string;
  clientId?: string | null;
  enabled?: boolean;
  onCompleted: () => void | Promise<void>;
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !clientId) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
    if (existing && window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(
      currency || "USD",
    )}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError("Could not load PayPal JavaScript SDK. Use direct sandbox capture below.");
    document.body.appendChild(script);
  }, [enabled, clientId, currency]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;
    containerRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: {
        layout: "horizontal",
        color: "gold",
        shape: "rect",
        label: "pay",
        height: 38,
      },
      createOrder: async () => {
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

  const handleServerSideFlow = async () => {
    setBusy(true);
    setSdkError(null);
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
  };

  const displayPrice = amountDisplay || (typeof amount === "number" ? formatCurrency(amount, currency || "USD") : "—");

  return (
    <div className="space-y-2.5 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-3.5 sm:p-4 shadow-surface">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#365FEA]" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#202722]">
            {label || "PayPal Settlement Execution"}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-[#202722]">
          {displayPrice}
        </span>
      </div>

      {enabled && clientId && (
        <div ref={containerRef} className="min-h-[40px] rounded-md bg-[#F0EEE7] p-2" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-[#69736D]">
          {enabled
            ? "Creates a real PayPal Order v2 and captures settlement into the task ledger."
            : "Creates and captures a deterministic simulated order in the task ledger."}
        </p>
        <Button size="sm" variant="primary" loading={busy} onClick={handleServerSideFlow}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {enabled ? "Create & Capture Sandbox Order" : "Execute Simulated Settlement"}
        </Button>
      </div>

      {message && (
        <div className="flex items-center gap-1.5 text-xs text-[#285E43]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {sdkError && (
        <div className="flex items-center gap-1.5 text-xs text-[#8C500B]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{sdkError}</span>
        </div>
      )}
    </div>
  );
}

export const PayPalCheckout = PayPalCheckoutCard;
