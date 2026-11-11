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

describe("LandingPage SaaS redesign, partner strip, and workflow", () => {
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
    expect(strip.closest("#product")).not.toBeNull();
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

  it("renders the 6-step From request to verified result workflow and updates the detail panel on selection", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /From request to verified result/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Six simple steps take every task from the first request to the completed result\./i),
    ).toBeInTheDocument();

    const expectedSteps = [
      "Request & Task Setup",
      "Specialist Matching",
      "Eligibility & Priority Dispatch",
      "Human Work & Evidence",
      "Security & Quality Checks",
      "Verified Result & Payment",
    ];

    for (const stepTitle of expectedSteps) {
      expect(screen.getAllByText(stepTitle).length).toBeGreaterThanOrEqual(1);
    }

    const securityTab = screen.getByRole("tab", { name: /Security & Quality Checks/i });
    fireEvent.click(securityTab);
    expect(securityTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Step 05/i)).toBeInTheDocument();

    const resultTab = screen.getByRole("tab", { name: /Verified Result & Payment/i });
    fireEvent.click(resultTab);
    expect(resultTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Step 06/i)).toBeInTheDocument();
  });

  it("replaces the right-side hero flow card with the Originkit Hero 22 visual while preserving left hero content and Venom CTA", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/End-to-End Task Flow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/6 verified stages/i)).not.toBeInTheDocument();

    expect(screen.getByLabelText(/Interactive human and AI neural coordination diagram/i)).toBeInTheDocument();
    expect(screen.getByText("Decision Engine")).toBeInTheDocument();
    expect(screen.getByText("Neural Processing")).toBeInTheDocument();
    expect(screen.getByText("Agent Coordination")).toBeInTheDocument();

    expect(screen.getAllByRole("link", { name: /Start as a Requester/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Become a Specialist/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Developer Docs/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Get Started/i })).toHaveLength(2);
  });
});
