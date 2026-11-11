import { Badge } from "@/components/ui/badge";
import { paymentTone, taskStatusTone, verificationTone } from "@/lib/format";
import {
  paymentStatusLabel,
  riskLevelLabel,
  securityVerdictLabel,
  taskStatusLabel,
  verificationStatusLabel,
} from "@/lib/status-labels";
import type { PayoutAvailability } from "@/lib/types";

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  return (
    <Badge tone={taskStatusTone(status)} dot={dot}>
      {taskStatusLabel(status)}
    </Badge>
  );
}

export const TaskStatusBadge = StatusBadge;

export function UrgencyBadge({ urgency }: { urgency?: string }) {
  const value = urgency ?? "NORMAL";
  const tone = value === "CRITICAL" ? "danger" : value === "HIGH" ? "warning" : "neutral";
  return (
    <Badge tone={tone} dot>
      {riskLevelLabel(value)}
    </Badge>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  return (
    <Badge tone={verificationTone(status)} dot>
      {verificationStatusLabel(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={paymentTone(status)} dot>
      {paymentStatusLabel(status)}
    </Badge>
  );
}

export function ModeBadge({ mode }: { mode: "SIMULATED" | "SANDBOX" }) {
  return (
    <Badge tone={mode === "SIMULATED" ? "warning" : "info"}>
      {mode === "SIMULATED" ? "Practice Mode" : "PayPal Test Mode"}
    </Badge>
  );
}

export function PayoutAvailabilityBadge({
  availability,
  className,
}: {
  availability?: PayoutAvailability | string | null;
  className?: string;
}) {
  const value = availability ?? "DEMO_SIMULATED";
  const label =
    value === "SANDBOX_ENABLED"
      ? "Test Payouts Ready"
      : value === "PAYOUT_UNAVAILABLE"
        ? "Payout Unavailable"
        : "Simulated Payouts";
  const tone =
    value === "SANDBOX_ENABLED" ? "success" : value === "PAYOUT_UNAVAILABLE" ? "warning" : "info";
  return (
    <Badge tone={tone} dot data-availability={value} className={className}>
      {label}
    </Badge>
  );
}

export function SecurityVerdictBadge({
  verdict,
  className,
}: {
  verdict: string;
  className?: string;
}) {
  const upper = verdict.toUpperCase();
  const label = securityVerdictLabel(upper);
  const tone =
    upper === "PASS" || upper === "PASSED" || upper === "CLEAN"
      ? "success"
      : upper === "BLOCK" || upper === "BLOCKED" || upper === "SAFETY_REJECTED"
        ? "danger"
        : upper === "REVIEW" ||
            upper === "WARN" ||
            upper === "WARNING" ||
            upper === "NEEDS_HUMAN_REVIEW"
          ? "warning"
          : "neutral";
  return (
    <Badge tone={tone} dot data-verdict={upper} className={className}>
      {label}
    </Badge>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const tone =
    risk === "HIGH" || risk === "CRITICAL" ? "danger" : risk === "MEDIUM" ? "warning" : "success";
  return <Badge tone={tone}>{riskLevelLabel(risk)}</Badge>;
}

export function skillLevelLabel(level: number): string {
  if (level >= 3) return "Advanced";
  if (level === 2) return "Practitioner";
  return "Foundation";
}

export function SkillLevelBadge({ name, level }: { name?: string; level: number }) {
  const tone = level >= 3 ? "indigo" : level === 2 ? "cobalt" : "success";
  return (
    <Badge tone={tone} dot>
      {name ? `${name} · Level ${level}` : `Level ${level} ${skillLevelLabel(level)}`}
    </Badge>
  );
}
