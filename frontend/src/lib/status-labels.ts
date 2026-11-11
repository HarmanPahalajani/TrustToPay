import { humanize } from "./format";

/**
 * Human-friendly status vocabulary mapped cleanly from backend enum values.
 * Wire enum strings remain unchanged across API calls.
 */
const TASK_STATUS_LABELS: Record<string, string> = {
  AWAITING_FUNDING: "Payment pending",
  PAYMENT_PROCESSING: "Payment pending",
  PAYMENT_READY: "Finding a specialist",
  FUNDED: "Payment complete",
  FUNDING_FAILED: "Payment failed",
  OFFERED: "Waiting for acceptance",
  REVIEWER_ASSIGNED: "Specialist assigned",
  ASSIGNED: "Specialist assigned",
  IN_PROGRESS: "Work in progress",
  SUBMISSION_RECEIVED: "Submitted for review",
  SUBMITTED: "Submitted for review",
  UNDER_VERIFICATION: "Safety review in progress",
  VERIFICATION_PENDING: "Safety review in progress",
  NEEDS_MANUAL_REVIEW: "Waiting for further review",
  NEEDS_HUMAN_REVIEW: "Waiting for further review",
  VERIFICATION_REJECTED: "Submission rejected",
  SAFETY_REJECTED: "Submission rejected",
  NEEDS_REVISION: "Revision requested",
  VERIFIED: "Completed",
  HANDED_OFF: "Completed",
  ORIGINAL_TASK_RESUMED: "Completed",
  PAYMENT_PAID: "Payment complete",
  PAYOUT_FAILED: "Payout delayed",
  COMPLETED: "Completed",
  DISPUTED: "Under review",
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
  PENDING: "Safety review in progress",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Payment pending",
  PENDING: "Payment pending",
  PROCESSING: "Processing payment",
  COMPLETED: "Payment complete",
  PAID: "Payment complete",
  SUCCESS: "Payment complete",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  DENIED: "Declined",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  TASK_CREATED: "Task created",
  ORDER_CREATED: "Payment started",
  FUNDING_CAPTURED: "Payment complete",
  FUNDING_FAILED: "Payment failed",
  OFFERS_DISPATCHED: "Finding a specialist",
  OFFER_ACCEPTED: "Task accepted",
  TASK_CLAIMED: "Specialist assigned",
  SUBMISSION_UPLOADED: "Submitted for review",
  VERIFICATION_STARTED: "Automatic safety checks started",
  VERIFICATION_PASSED: "Safety checks passed",
  VERIFICATION_REJECTED: "Submission rejected",
  SECURITY_CHECK_PASSED: "Safety checks passed",
  SECURITY_CHECK_FLAGGED: "Additional safety review requested",
  MANUAL_REVIEW_REQUIRED: "Waiting for further review",
  RESULT_HANDED_OFF: "Completed work returned",
  ORIGINAL_TASK_RESUMED: "Task completed",
  PAYOUT_CREATED: "Payment scheduled",
  PAYOUT_COMPLETED: "Payment complete",
  PAYOUT_FAILED: "Payout unavailable",
  DISPUTE_OPENED: "Issue reported",
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
