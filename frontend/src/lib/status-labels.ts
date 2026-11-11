import { humanize } from "./format";

/**
 * Human-friendly status vocabulary mapped cleanly from backend enum values.
 * Wire enum strings remain unchanged across API calls.
 */
const TASK_STATUS_LABELS: Record<string, string> = {
  AWAITING_FUNDING: "Waiting for payment",
  PAYMENT_PROCESSING: "Processing payment",
  PAYMENT_READY: "Payment ready",
  FUNDED: "Payment ready",
  FUNDING_FAILED: "Payment failed",
  OFFERED: "Matching specialists",
  REVIEWER_ASSIGNED: "Specialist assigned",
  ASSIGNED: "Specialist assigned",
  IN_PROGRESS: "In progress",
  SUBMISSION_RECEIVED: "Work submitted",
  SUBMITTED: "Work submitted",
  UNDER_VERIFICATION: "Checking submission",
  VERIFICATION_PENDING: "Checking submission",
  NEEDS_MANUAL_REVIEW: "Waiting for further review",
  NEEDS_HUMAN_REVIEW: "Waiting for further review",
  VERIFICATION_REJECTED: "Submission rejected",
  SAFETY_REJECTED: "Submission rejected",
  NEEDS_REVISION: "Revision requested",
  VERIFIED: "Verified",
  HANDED_OFF: "Result delivered",
  ORIGINAL_TASK_RESUMED: "Workflow resumed",
  PAYMENT_PAID: "Paid",
  PAYOUT_FAILED: "Payout delayed",
  COMPLETED: "Completed",
  DISPUTED: "Under dispute",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const SECURITY_VERDICT_LABELS: Record<string, string> = {
  PASS: "Passed",
  PASSED: "Passed",
  CLEAN: "Passed",
  BLOCK: "Blocked",
  BLOCKED: "Blocked",
  NEEDS_HUMAN_REVIEW: "Waiting for further review",
  SAFETY_REVIEW_FAILED: "Additional review unavailable",
  SAFETY_REJECTED: "Submission rejected",
  WARN: "Needs review",
  WARNING: "Needs review",
  REVIEW: "Waiting for further review",
};

const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PASSED: "Checks passed",
  REJECTED: "Submission rejected",
  NEEDS_MANUAL_REVIEW: "Waiting for further review",
  PENDING: "Checking submission",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Started",
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Paid",
  PAID: "Paid",
  SUCCESS: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  DENIED: "Declined",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  TASK_CREATED: "Task created",
  ORDER_CREATED: "Payment started",
  FUNDING_CAPTURED: "Payment ready",
  FUNDING_FAILED: "Payment failed",
  OFFERS_DISPATCHED: "Specialists notified",
  OFFER_ACCEPTED: "Offer accepted",
  TASK_CLAIMED: "Specialist assigned",
  SUBMISSION_UPLOADED: "Work submitted",
  VERIFICATION_STARTED: "Automatic checks started",
  VERIFICATION_PASSED: "Work verification passed",
  VERIFICATION_REJECTED: "Submission rejected",
  SECURITY_CHECK_PASSED: "Security checks passed",
  SECURITY_CHECK_FLAGGED: "Additional security review requested",
  MANUAL_REVIEW_REQUIRED: "Waiting for further review",
  RESULT_HANDED_OFF: "Verified result delivered",
  ORIGINAL_TASK_RESUMED: "AI workflow resumed",
  PAYOUT_CREATED: "Reward scheduled",
  PAYOUT_COMPLETED: "Reward paid",
  PAYOUT_FAILED: "Payout unavailable",
  DISPUTE_OPENED: "Dispute opened",
  TASK_CANCELLED: "Task cancelled",
};

export function taskStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return TASK_STATUS_LABELS[status.toUpperCase()] ?? humanize(status);
}

export function securityVerdictLabel(verdict: string | null | undefined): string {
  if (!verdict) return "Pending";
  return SECURITY_VERDICT_LABELS[verdict.toUpperCase()] ?? humanize(verdict);
}

export function verificationStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return VERIFICATION_STATUS_LABELS[status.toUpperCase()] ?? humanize(status);
}

export function paymentStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return PAYMENT_STATUS_LABELS[status.toUpperCase()] ?? humanize(status);
}

export function taskEventLabel(type: string | null | undefined): string {
  if (!type) return "Update";
  return EVENT_TYPE_LABELS[type.toUpperCase()] ?? humanize(type);
}

export function riskLevelLabel(risk: string | null | undefined): string {
  const upper = (risk ?? "NORMAL").toUpperCase();
  if (upper === "CRITICAL") return "Critical priority";
  if (upper === "HIGH") return "High priority";
  if (upper === "LOW") return "Low priority";
  return "Standard";
}
