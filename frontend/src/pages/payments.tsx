import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Download,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Payment } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, StatCard } from "@/components/common";
import { PaymentStatusBadge, PayoutAvailabilityBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import { paymentStatusLabel } from "@/lib/status-labels";

const STATUSES = ["CREATED", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"];

export default function PaymentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [type, setType] = useState(params.get("type") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [mode, setMode] = useState(params.get("mode") ?? "");
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["payments", { page, type, status, mode }],
    queryFn: () =>
      api.payments.list({
        page,
        pageSize: 20,
        type: type || undefined,
        status: status || undefined,
        mode: mode || undefined,
      }),
  });

  const reconcile = useMutation({
    mutationFn: (id: string) => api.payments.reconcile(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["task"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Reconciliation failed."),
  });

  const retry = useMutation({
    mutationFn: (id: string) => api.payments.retry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["task"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Retry failed."),
  });

  function updateFilter(key: "type" | "status" | "mode", value: string) {
    if (key === "type") setType(value);
    if (key === "status") setStatus(value);
    if (key === "mode") setMode(value);
    setPage(1);
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const items = query.data?.items ?? [];
  const pagination = query.data?.pagination;
  const completed = items.filter((payment) => payment.status === "COMPLETED");
  const failed = items.filter((payment) => payment.status === "FAILED");
  const pending = items.filter((payment) => ["CREATED", "PENDING", "PROCESSING"].includes(payment.status));
  const completedMinor = completed.reduce((sum, payment) => sum + payment.amountMinor, 0);
  const currency = items[0]?.currency ?? "USD";

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          user?.role === "REVIEWER"
            ? "Payout history"
            : "Payment history"
        }
        description={
          user?.role === "REVIEWER"
            ? "Track specialist payments for completed tasks."
            : "Track task payments and specialist payouts."
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={user?.role === "REVIEWER" ? "/app/earnings" : "/app/requests"}>
                <ArrowLeft className="size-4" /> {user?.role === "REVIEWER" ? "Earnings" : "My Tasks"}
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const rows = [
                  ["id", "type", "status", "mode", "amount_minor", "currency", "provider", "task", "created_at"],
                  ...items.map((payment) => [
                    payment.id,
                    payment.type,
                    payment.status,
                    payment.mode,
                    String(payment.amountMinor),
                    payment.currency,
                    payment.provider,
                    payment.task?.title ?? payment.taskId,
                    payment.createdAt,
                  ]),
                ];
                const csv = rows
                  .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "trusttopay-payments.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
              disabled={items.length === 0}
            >
              <Download className="size-4" /> Export visible
            </Button>
          </>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completed (visible)"
          value={new Intl.NumberFormat("en-US", { style: "currency", currency }).format(completedMinor / 100)}
          hint={`${completed.length} payment${completed.length === 1 ? "" : "s"} on this page`}
          icon={<Banknote className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Pending"
          value={pending.length}
          hint="Refresh status before retrying"
          icon={<RefreshCw className="size-4" />}
          tone={pending.length > 0 ? "info" : "neutral"}
        />
        <StatCard
          label="Needs attention"
          value={failed.length}
          hint="Failed payments remain visible here"
          icon={<ShieldCheck className="size-4" />}
          tone={failed.length > 0 ? "danger" : "neutral"}
        />
        <StatCard
          label="Total payments"
          value={pagination?.total ?? 0}
          hint={user?.role === "REVIEWER" ? "Payouts assigned to you" : "Your task payments"}
          icon={<CreditCard className="size-4" />}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-wrap gap-2">
            <select
              value={type}
              onChange={(event) => updateFilter("type", event.target.value)}
              className="h-10 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] px-3 text-sm text-[#202722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365FEA]"
              aria-label="Filter payment type"
            >
              <option value="">All types</option>
              <option value="FUNDING">Task payment</option>
              <option value="PAYOUT">Specialist payout</option>
            </select>
            <select
              value={status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="h-10 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] px-3 text-sm text-[#202722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365FEA]"
              aria-label="Filter payment status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {paymentStatusLabel(option)}
                </option>
              ))}
            </select>
            <select
              value={mode}
              onChange={(event) => updateFilter("mode", event.target.value)}
              className="h-10 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] px-3 text-sm text-[#202722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365FEA]"
              aria-label="Filter payment mode"
            >
              <option value="">All payment types</option>
              <option value="SIMULATED">Test payment (local)</option>
              <option value="SANDBOX">PayPal test payment</option>
            </select>
          </div>
          {type || status || mode ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setType("");
                setStatus("");
                setMode("");
                setPage(1);
                setParams({}, { replace: true });
              }}
            >
              Clear filters
            </Button>
          ) : null}
          <p className="text-xs font-medium text-[#69736D]">
            Test payments never charge real money.
          </p>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <LoadingBlock label="Loading payment history…" />
      ) : query.error ? (
        <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" />}
          title="No payments match"
          description="Task payments appear here once you pay for a task or receive a specialist payout."
          action={
            type || status || mode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setType("");
                  setStatus("");
                  setMode("");
                  setParams({}, { replace: true });
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1.4fr_0.8fr_0.9fr_0.7fr_0.9fr_0.8fr] gap-3 border-b border-[#E5E1D7] bg-[#F0EEE7] px-4 py-3 text-xs font-semibold text-[#69736D] lg:grid">
              <span>Task</span>
              <span>Type</span>
              <span>Method</span>
              <span className="text-right">Amount</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-[#E5E1D7]">
              {items.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  isAdmin={user?.role === "REQUESTER"}
                  onReconcile={() => reconcile.mutate(payment.id)}
                  reconciling={reconcile.isPending}
                  onRetry={() => retry.mutate(payment.id)}
                  retrying={retry.isPending}
                />
              ))}
            </div>
          </Card>

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                <ArrowLeft className="size-3.5" /> Previous
              </Button>
              <p className="text-xs text-[#69736D] tabular-nums">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next <ArrowRight className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function PaymentRow({
  payment,
  isAdmin,
  onReconcile,
  reconciling,
  onRetry,
  retrying,
}: {
  payment: Payment;
  isAdmin: boolean;
  onReconcile: () => void;
  reconciling: boolean;
  onRetry: () => void;
  retrying: boolean;
}) {
  const canReconcile = ["FAILED", "PROCESSING", "PENDING"].includes(payment.status);
  return (
    <div className="grid gap-3 px-4 py-3.5 lg:grid-cols-[1.4fr_0.8fr_0.9fr_0.7fr_0.9fr_0.8fr] lg:items-center">
      <div className="min-w-0">
        {payment.task ? (
          <Link to={`/app/tasks/${payment.task.id}`} className="line-clamp-1 text-sm font-medium text-[#202722] hover:text-[#365FEA]">
            {payment.task.title}
          </Link>
        ) : (
          <p className="text-sm font-medium text-[#202722]">Task payment</p>
        )}
        <p className="mt-0.5 text-xs text-[#69736D] tabular-nums">{formatDate(payment.createdAt)}</p>
        {payment.failureMessage ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#C8372D]">{payment.failureMessage}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#202722]">
        {payment.type === "FUNDING" ? <CreditCard className="size-3.5 text-[#365FEA]" /> : <Wallet className="size-3.5 text-[#438866]" />}
        {payment.type === "FUNDING" ? "Task payment" : "Specialist payout"}
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {payment.type === "PAYOUT" ? (
            <PayoutAvailabilityBadge
              availability={payment.payoutAvailability ?? (payment.mode === "SIMULATED" ? "DEMO_SIMULATED" : undefined)}
            />
          ) : (
            <span className="text-xs font-medium text-[#202722]">
              {payment.mode === "SIMULATED" ? "Test payment" : payment.provider}
            </span>
          )}
        </div>
        <p className="text-xs text-[#69736D]">{payment.provider}</p>
      </div>
      <div className="text-left text-sm font-semibold text-[#202722] tabular-nums lg:text-right">{payment.amountDisplay}</div>
      <div>
        <PaymentStatusBadge status={payment.status} />
        {payment.recipientEmail ? (
          <p className="mt-1 truncate text-xs text-[#69736D]">{payment.recipientEmail}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5 lg:justify-end">
        {canReconcile ? (
          <Button variant="outline" size="sm" onClick={onReconcile} loading={reconciling}>
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        ) : null}
        {isAdmin && payment.status === "FAILED" ? (
          <Button variant="ghost" size="sm" onClick={onRetry} loading={retrying}>
            Retry
          </Button>
        ) : null}
        {!canReconcile && !(isAdmin && payment.status === "FAILED") ? (
          <span className="text-xs text-[#69736D]">
            {payment.status === "COMPLETED" ? (payment.mode === "SIMULATED" ? "Test payment" : "Completed") : "—"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
