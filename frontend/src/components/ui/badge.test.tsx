import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";
import { PayoutAvailabilityBadge, SecurityVerdictBadge } from "../status-badges";

describe("Badge", () => {
  it("renders its tone and content", () => {
    render(<Badge tone="success">Verified</Badge>);

    const badge = screen.getByText("Verified");
    expect(badge).toHaveClass("bg-[#12A875]/10", "text-[#0B7D56]");
  });

  it("uses the neutral tone by default", () => {
    render(<Badge>Draft</Badge>);

    expect(screen.getByText("Draft")).toHaveClass("bg-[#EDF0F6]", "text-[#4E596E]");
  });

  it("renders a decorative dot when requested", () => {
    const { container } = render(
      <Badge tone="warning" dot>
        Disputed
      </Badge>,
    );

    const dot = container.querySelector("span span");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-hidden");
  });

  it("merges custom classes", () => {
    render(<Badge className="ml-2">Extra</Badge>);

    expect(screen.getByText("Extra")).toHaveClass("ml-2");
  });

  it("renders PayoutAvailabilityBadge and SecurityVerdictBadge states", () => {
    render(
      <div>
        <PayoutAvailabilityBadge availability="DEMO_SIMULATED" />
        <PayoutAvailabilityBadge availability="PAYOUT_UNAVAILABLE" />
        <SecurityVerdictBadge verdict="PASS" />
        <SecurityVerdictBadge verdict="BLOCK" />
      </div>,
    );

    expect(screen.getByText("Simulated Payouts")).toHaveAttribute("data-availability", "DEMO_SIMULATED");
    expect(screen.getByText("Payout Unavailable")).toHaveAttribute("data-availability", "PAYOUT_UNAVAILABLE");
    expect(screen.getByText("Passed")).toHaveAttribute("data-verdict", "PASS");
    expect(screen.getByText("Blocked")).toHaveAttribute("data-verdict", "BLOCK");
  });
});
