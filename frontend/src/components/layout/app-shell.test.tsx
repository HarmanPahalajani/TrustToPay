import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Alex Requester", email: "alex@example.com", role: "REQUESTER" },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    demoLogin: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    auth: {
      notifications: vi.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
      markNotificationRead: vi.fn().mockResolvedValue({}),
      markAllNotificationsRead: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe("AppShell fixed workspace sidebar and visibility toggle", () => {
  it("keeps sidebar and main scroll panes separated on desktop and toggles sidebar visibility", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app/workspace"]}>
          <Routes>
            <Route path="/app" element={<AppShell />}>
              <Route path="workspace" element={<div>Workspace body content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const shell = container.firstElementChild as HTMLElement;
    expect(shell.className).toContain("lg:h-dvh");
    expect(shell.className).toContain("lg:overflow-hidden");

    const main = screen.getByRole("main");
    expect(main.className).toContain("lg:overflow-y-auto");

    const sidebar = screen.getByLabelText("Workspace sidebar");
    expect(sidebar).toHaveAttribute("aria-hidden", "false");
    expect(sidebar.className).toContain("lg:w-64");

    const hideButton = screen.getByRole("button", { name: "Hide sidebar" });
    expect(hideButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(hideButton);

    const showButton = screen.getByRole("button", { name: "Show sidebar" });
    expect(showButton).toHaveAttribute("aria-expanded", "false");
    expect(sidebar).toHaveAttribute("aria-hidden", "true");
    expect(sidebar.className).toContain("lg:w-0");

    fireEvent.click(showButton);
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toHaveAttribute("aria-expanded", "true");
    expect(sidebar).toHaveAttribute("aria-hidden", "false");
  });
});
