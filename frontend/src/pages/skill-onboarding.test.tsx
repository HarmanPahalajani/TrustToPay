import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import SkillOnboardingPage from "@/pages/skill-onboarding";

function jsonResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  } as unknown as Response;
}

const MOCK_CATEGORIES = [
  { id: "programming", name: "Programming Languages", description: "Core languages." },
  { id: "frontend", name: "Frontend Development", description: "UI." },
];

const MOCK_TAXONOMY = [
  {
    slug: "typescript",
    name: "TypeScript",
    categoryId: "programming",
    categoryName: "Programming Languages",
    description: "Strict typing and generics.",
    isAssessed: true,
  },
  {
    slug: "python",
    name: "Python",
    categoryId: "programming",
    categoryName: "Programming Languages",
    description: "Asyncio and clean code.",
    isAssessed: true,
  },
  {
    slug: "react",
    name: "React",
    categoryId: "frontend",
    categoryName: "Frontend Development",
    description: "Component architecture.",
    isAssessed: false,
  },
];

function renderOnboardingApp(role: "REVIEWER" | "REQUESTER" = "REVIEWER") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes("/auth/me")) {
      return Promise.resolve(
        jsonResponse({
          user: {
            id: "rev_user_1",
            email: "reviewer@demo.trusttopay.dev",
            name: "Verified Specialist",
            role,
            isReviewerApproved: true,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          unreadNotifications: 0,
        }),
      );
    }
    if (url.includes("/skills/taxonomy")) {
      return Promise.resolve(
        jsonResponse({
          categories: MOCK_CATEGORIES,
          taxonomy: MOCK_TAXONOMY,
        }),
      );
    }
    if (url.includes("/skills/selected")) {
      if (init?.method === "POST") {
        const body = JSON.parse(init.body as string);
        return Promise.resolve(
          jsonResponse({
            success: true,
            selectedSkills: body.skillSlugs,
          }),
        );
      }
      return Promise.resolve(jsonResponse({ selectedSkills: ["typescript"] }));
    }
    if (url.includes("/skills")) {
      return Promise.resolve(
        jsonResponse({
          skills: [
            {
              id: "sk_ts",
              slug: "typescript",
              name: "TypeScript",
              category: "PROGRAMMING",
              description: "Strict typing",
              version: "1.0.0",
              verifiedLevel: 0,
              verifiedLevelName: null,
              verifiedAt: null,
              stages: [],
            },
          ],
        }),
      );
    }
    return Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "Not found" } }, 404));
  });
  vi.stubGlobal("fetch", fetchMock);

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app/onboarding/skills"]}>
        <AuthProvider>
          <Routes>
            <Route path="/app/onboarding/skills" element={<SkillOnboardingPage />} />
            <Route path="/app" element={<div data-testid="requester-dashboard">Requester Dashboard</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Phase 2 — Skill Catalogue & Reviewer Onboarding Page", () => {
  it("renders the approved heading, supporting text, categories, and selection drawer", async () => {
    renderOnboardingApp("REVIEWER");

    // Check heading and supporting text
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /What can you help with\?/i })).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /Select the skills you can confidently work with\. Your selected skills will be assessed to establish your verified proficiency levels\./i,
      ),
    ).toBeInTheDocument();

    // Check categories and skills rendered
    await waitFor(() => {
      expect(screen.getByText(/All Domains/i)).toBeInTheDocument();
      expect(screen.getByText(/Programming Languages/i)).toBeInTheDocument();
      expect(screen.getByText(/Frontend Development/i)).toBeInTheDocument();
    });

    // Check selected skills drawer
    expect(screen.getAllByText(/Selected Skills/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Begin Assessment/i })).toBeInTheDocument();
  });

  it("redirects Requesters away from reviewer skill onboarding to /app", async () => {
    renderOnboardingApp("REQUESTER");

    await waitFor(() => {
      expect(screen.getByTestId("requester-dashboard")).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: /What can you help with\?/i })).not.toBeInTheDocument();
  });
});
