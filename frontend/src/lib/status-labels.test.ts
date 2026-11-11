import { describe, expect, it } from "vitest";
import {
  paymentStatusLabel,
  riskLevelLabel,
  securityVerdictLabel,
  taskEventLabel,
  taskStatusLabel,
  verificationStatusLabel,
} from "./status-labels";

describe("human-friendly status labels", () => {
  it("maps task statuses cleanly without exposing raw enum jargon", () => {
    expect(taskStatusLabel("PAYMENT_READY")).toBe("Finding a specialist");
    expect(taskStatusLabel("AWAITING_FUNDING")).toBe("Payment pending");
    expect(taskStatusLabel("IN_PROGRESS")).toBe("Work in progress");
    expect(taskStatusLabel("NEEDS_HUMAN_REVIEW")).toBe("Waiting for further review");
    expect(taskStatusLabel("SAFETY_REJECTED")).toBe("Submission rejected");
    expect(taskStatusLabel("VERIFICATION_PENDING")).toBe("Safety review in progress");
    expect(taskStatusLabel("REVIEWER_ASSIGNED")).toBe("Specialist assigned");
    expect(taskStatusLabel("VERIFIED")).toBe("Completed");
  });

  it("maps security verdicts and verification runs to clear plain language", () => {
    expect(securityVerdictLabel("PASS")).toBe("Passed");
    expect(securityVerdictLabel("BLOCK")).toBe("Blocked");
    expect(securityVerdictLabel("NEEDS_HUMAN_REVIEW")).toBe("Waiting for further review");
    expect(verificationStatusLabel("PASSED")).toBe("Checks passed");
    expect(verificationStatusLabel("NEEDS_MANUAL_REVIEW")).toBe("Waiting for further review");
  });

  it("maps payment, event, and priority labels cleanly", () => {
    expect(paymentStatusLabel("COMPLETED")).toBe("Payment complete");
    expect(taskEventLabel("VERIFICATION_PASSED")).toBe("Safety checks passed");
    expect(riskLevelLabel("HIGH")).toBe("High priority");
  });
});
