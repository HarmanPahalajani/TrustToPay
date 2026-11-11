import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PayPalLogo, ElasticLogo, RenderLogo } from "@/components/partner-logos";
import { cn } from "@/lib/utils";

/**
 * TrustToPay bespoke brand mark:
 * Deep navy rounded frame (#10172A) containing a cobalt agent branch (#4263EB),
 * a crisp white human execution branch (#FFFFFF), and an emerald verification node (#12A875).
 */
export function TrustToPayLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect x="2" y="2" width="32" height="32" rx="8" fill="#10172A" stroke="#1E293B" strokeWidth="1.2" />
      <path
        d="M10.5 11.5H17.5C20.2 11.5 22 13.3 22 15.8"
        stroke="#4263EB"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M10.5 24.5H17.5C20.2 24.5 22 22.7 22 20.2"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="11.5" r="2.2" fill="#20BCE5" />
      <circle cx="10.5" cy="24.5" r="2.2" fill="#FFFFFF" />
      <circle cx="22" cy="18" r="3" fill="#12A875" />
      <path
        d="M25 18H27.5"
        stroke="#12A875"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({
  to = "/",
  compact = false,
  tone = "default",
}: {
  to?: string;
  compact?: boolean;
  tone?: "default" | "inverse";
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4263EB]"
    >
      <TrustToPayLogoMark />
      <div className="leading-tight">
        <span
          className={cn(
            "font-display text-[17px] font-extrabold tracking-tight",
            tone === "inverse" ? "text-white" : "text-[#141B2D]",
          )}
        >
          TrustToPay
        </span>
        {!compact ? (
          <span
            className={cn(
              "block font-mono text-[9.5px] font-medium uppercase tracking-[0.14em]",
              tone === "inverse" ? "text-[#94A3B8]" : "text-[#68738A]",
            )}
          >
            Human Execution Layer
          </span>
        ) : null}
      </div>
    </Link>
  );
}

const NAV_LINKS = [
  { label: "Product", to: "/#product" },
  { label: "How It Works", to: "/#workflow" },
  { label: "For Developers", to: "/#developers" },
  { label: "For Specialists", to: "/#specialists" },
  { label: "Security", to: "/#security" },
];

export function PublicHeader() {
  const { user } = useAuth();
  const { pathname, hash } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E4E9F2] bg-[#FFFFFF]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const targetHash = item.to.replace("/", "");
            const active = pathname === "/" && hash === targetHash;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#EDF0F6] hover:text-[#141B2D]",
                  active ? "bg-[#EDF0F6] font-semibold text-[#4263EB]" : "text-[#4E596E]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {user ? (
            <Button asChild size="default">
              <Link to="/app">
                Open Workspace <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="default">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild variant="default" size="default">
                <Link to="/register">
                  Get Started <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] hover:bg-[#EDF0F6] lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#E4E9F2] bg-[#FFFFFF] px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#141B2D] hover:bg-[#EDF0F6]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#E4E9F2] pt-4 sm:grid-cols-2">
            {user ? (
              <Button asChild size="lg" className="w-full">
                <Link to="/app" onClick={() => setMobileOpen(false)}>
                  Open Workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full">
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#1E293B] bg-[#10172A] text-[#CBD5E1]">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Brand tone="inverse" />
            <p className="max-w-sm text-xs leading-6 text-[#94A3B8]">
              The secure human execution layer for AI agents. Hybrid retrieval routes blockers to verified human
              specialists, deterministic scanners and Gemini inspect deliverables, and PayPal supports checkout and
              settlement tracking.
            </p>
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <PayPalLogo tone="inverse" className="h-5" />
              <ElasticLogo tone="inverse" className="h-5" />
              <RenderLogo tone="inverse" className="h-5" />
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Platform</p>
            <ul className="space-y-2 text-[#94A3B8]">
              <li>
                <Link to="/#workflow" className="transition-colors hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#developers" className="transition-colors hover:text-white">
                  For Developers
                </Link>
              </li>
              <li>
                <Link to="/#specialists" className="transition-colors hover:text-white">
                  For Specialists
                </Link>
              </li>
              <li>
                <Link to="/#security" className="transition-colors hover:text-white">
                  Security Architecture
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Infrastructure
            </p>
            <ul className="space-y-2 text-[#94A3B8]">
              <li>
                <Link to="/app/docs" className="transition-colors hover:text-white">
                  MCP &amp; REST Documentation
                </Link>
              </li>
              <li>
                <Link to="/app/integrations" className="transition-colors hover:text-white">
                  Live Integration Status
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Data Governance &amp; Privacy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Support &amp; Security Ops
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Workspace</p>
            <ul className="space-y-2 text-[#94A3B8]">
              <li>
                <Link to="/login" className="transition-colors hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-white">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/app/marketplace" className="transition-colors hover:text-white">
                  Specialist Marketplace
                </Link>
              </li>
              <li>
                <Link to="/app/workspace" className="transition-colors hover:text-white">
                  Agent Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#1E293B] pt-6 text-[11px] text-[#94A3B8] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-[#12A875]" />
            <span>
              PayPal Sandbox environment with explicit simulated demo fallback labels. SHA-256 artifact digests &amp;
              HMAC-SHA256 signed handbacks.
            </span>
          </div>
          <p className="shrink-0 font-mono text-[11px]">© {new Date().getFullYear()} TrustToPay</p>
        </div>
      </div>
    </footer>
  );
}
