import React, { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, CreditCard, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import type { CommandPaymentRow } from "@/lib/types";
import { DataGrid } from "@/components/ui/data-grid";
import { formatDate } from "@/lib/format";

interface PaymentTransactionsGridProps {
  payments: CommandPaymentRow[] | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectPayment?: (payment: CommandPaymentRow | null) => void;
  height?: string | number;
}

export function PaymentTransactionsGrid({
  payments,
  isLoading = false,
  error = null,
  onRetry,
  onSelectPayment,
  height = "480px",
}: PaymentTransactionsGridProps) {
  const columnDefs = useMemo<ColDef<CommandPaymentRow>[]>(
    () => [
      {
        field: "transactionId",
        headerName: "Transaction ID",
        width: 140,
        cellRenderer: (params: any) => {
          const id = params.value ?? "";
          return (
            <div className="flex items-center h-full">
              <span className="font-mono text-xs font-semibold text-[#202722]" title={id}>
                {id.length > 12 ? `${id.slice(0, 10)}…` : id}
              </span>
            </div>
          );
        },
      },
      {
        field: "taskTitle",
        headerName: "Associated Task",
        minWidth: 220,
        flex: 1.3,
        cellRenderer: (params: any) => {
          const row: CommandPaymentRow = params.data;
          if (!row) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-xs text-[#202722] truncate" title={row.taskTitle}>
                {row.taskTitle}
              </span>
              <span className="font-mono text-[10px] text-[#69736D] truncate">
                Task ID: {row.taskId}
              </span>
            </div>
          );
        },
      },
      {
        field: "human",
        headerName: "Beneficiary / Human",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="text-xs font-medium text-[#202722] truncate">{params.value}</span>
            </div>
          );
        },
      },
      {
        field: "reward",
        headerName: "Amount",
        width: 110,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="font-mono text-xs font-bold text-[#2B6146] bg-[#438866]/10 px-2 py-0.5 rounded-md border border-[#438866]/20">
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        field: "paymentMethod",
        headerName: "Method / Rail",
        minWidth: 180,
        flex: 1,
        cellRenderer: (params: any) => {
          const method = params.value ?? "";
          const isOrders = method.includes("Orders");
          return (
            <div className="flex items-center gap-1.5 h-full">
              <CreditCard className="size-3.5 text-[#365FEA]" />
              <span className="text-xs font-medium text-[#4B554F]">{method}</span>
            </div>
          );
        },
      },
      {
        field: "mode",
        headerName: "Environment",
        width: 120,
        cellRenderer: (params: any) => {
          const mode = params.value;
          const isSandbox = mode === "SANDBOX";
          return (
            <div className="flex items-center h-full">
              <span
                className={`inline-flex items-center justify-center h-5 px-2 rounded-full text-[10px] font-semibold leading-none border ${
                  isSandbox
                    ? "bg-[#365FEA]/10 text-[#2B4FC7] border-[#365FEA]/30"
                    : "bg-[#F7F5EF] text-[#69736D] border-[#E5E1D7]"
                }`}
              >
                {isSandbox ? "PayPal Sandbox" : "Simulated"}
              </span>
            </div>
          );
        },
      },
      {
        field: "paymentStatus",
        headerName: "Payment Status",
        width: 130,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isSuccess = status === "COMPLETED";
          const isPending = ["PENDING", "PROCESSING", "CREATED"].includes(status);
          return (
            <div className="flex items-center gap-1.5 h-full">
              {isSuccess ? (
                <CheckCircle2 className="size-3.5 text-[#438866]" />
              ) : isPending ? (
                <Clock className="size-3.5 text-[#C97A2E]" />
              ) : (
                <XCircle className="size-3.5 text-[#E5484D]" />
              )}
              <span
                className={`text-xs font-semibold ${
                  isSuccess ? "text-[#2B6146]" : isPending ? "text-[#C97A2E]" : "text-[#E5484D]"
                }`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        field: "paypalReference",
        headerName: "PayPal Reference",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: any) => {
          const ref = params.value;
          return (
            <div className="flex items-center h-full">
              <span className="font-mono text-xs text-[#4B554F] truncate" title={ref}>
                {ref}
              </span>
            </div>
          );
        },
      },
      {
        field: "verificationStatus",
        headerName: "Pre-Payment Quality Check",
        minWidth: 170,
        flex: 1,
        cellRenderer: (params: any) => {
          const v = params.value ?? "";
          const isVerified = v.includes("Completed") || v.includes("Verified");
          return (
            <div className="flex items-center gap-1.5 h-full">
              <ShieldCheck className={`size-3.5 ${isVerified ? "text-[#438866]" : "text-[#69736D]"}`} />
              <span className={`text-xs ${isVerified ? "font-medium text-[#2B6146]" : "text-[#69736D]"}`}>
                {v}
              </span>
            </div>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Date",
        width: 110,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : "—"),
      },
    ],
    [],
  );

  return (
    <DataGrid<CommandPaymentRow>
      rowData={payments}
      columnDefs={columnDefs}
      title="PayPal Escrow & Disbursement Ledger"
      subtitle="Auditable records of upfront escrow authorizations, verification locks, and specialist payouts"
      height={height}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowSelect={onSelectPayment}
      exportFileName="trusttopay-paypal-transactions.csv"
    />
  );
}
