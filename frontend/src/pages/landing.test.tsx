import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "@/pages/landing";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    demoLogin: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("LandingPage SaaS redesign, partner strip, and interactive workflow", () => {
  it("renders the core headline, POWERED BY partner strip, and primary navigation links", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /When AI gets stuck, human expertise moves it forward\./i }),
    ).toBeInTheDocument();
    expect(screen.getByText("POWERED BY")).toBeInTheDocument();
    const strip = screen.getByLabelText(/Powered by technology partners/i);
    expect(strip).toBeInTheDocument();
    expect(strip).toHaveTextContent(/PayPal/i);
    expect(strip).toHaveTextContent(/Elastic/i);
    expect(strip).toHaveTextContent(/Render/i);

    expect(screen.getAllByText("TrustToPay").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: "Product" })[0]).toHaveAttribute("href", "/#product");
    expect(screen.getAllByRole("link", { name: "How It Works" })[0]).toHaveAttribute("href", "/#workflow");
    expect(screen.getAllByRole("link", { name: "For Developers" })[0]).toHaveAttribute("href", "/#developers");
    expect(screen.getAllByRole("link", { name: "Security" })[0]).toHaveAttribute("href", "/#security");
  });

  it("excludes seeded example tasks, demo credentials, and hackathon badges from the public homepage", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/65W USB-C charger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AnchorVolt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo1234!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hackathon project/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Smart India Hackathon/i)).not.toBeInTheDocument();
  });

  it("renders all 6 architecture workflow tabs and updates the synchronized inspector on selection", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    const expectedSteps = [
      "Agent Escalates Task",
      "Semantic Matching",
      "Eligibility & Ranking",
      "Human Execution",
      "Security & Verification",
      "Signed Result & Payment",
    ];

    for (const stepTitle of expectedSteps) {
      expect(screen.getAllByText(stepTitle).length).toBeGreaterThanOrEqual(1);
    }

    // Select Security & Verification tab
    const securityTab = screen.getByRole("tab", { name: /Security & Verification/i });
    fireEvent.click(securityTab);
    expect(securityTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Layered Verification Gate/i)).toBeInTheDocument();

    // Select Signed Result & Payment tab
    const paymentTab = screen.getByRole("tab", { name: /Signed Result & Payment/i });
    fireEvent.click(paymentTab);
    expect(paymentTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/GET \/api\/v1\/tasks\/:id\/handback/i)).toBeInTheDocument();
  });
});
