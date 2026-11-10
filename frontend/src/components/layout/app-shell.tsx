import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Bot,
  ChevronDown,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { humanize, initials, timeAgo } from "@/lib/format";

type NavItem = { to: string; label: string; icon: typeof Bot; end?: boolean };

function navFor(role: string | undefined): { primary: NavItem[]; secondary: NavItem[] } {
  if (role === "REVIEWER") {
    return {
      primary: [
        { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/app/onboarding/skills", label: "Skill Certifications", icon: ShieldCheck },
        { to: "/app/marketplace", label: "Available Offers", icon: Store },
        { to: "/app/reviews", label: "Active Tasks", icon: Bot },
        { to: "/app/earnings", label: "Earnings & Payouts", icon: Wallet },
      ],
      secondary: [
        { to: "/app/profile", label: "Skills & Profile", icon: UserRound },
        { to: "/app/integrations", label: "Integrations", icon: Plug },
        { to: "/app/docs", label: "Documentation", icon: BookOpen },
      ],
    };
  }
  return {
    primary: [
      { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/app/workspace", label: "Agent Workspace", icon: Bot },
      { to: "/app/requests", label: "My Requests", icon: Search },
      { to: "/app/payments", label: "Payments", icon: CreditCard },
    ],
    secondary: [
      { to: "/app/profile", label: "Profile & API Keys", icon: UserRound },
      { to: "/app/integrations", label: "Integrations", icon: Plug },
      { to: "/app/docs", label: "Documentation", icon: BookOpen },
    ],
  };
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.auth.notifications,
    refetchInterval: 60_000,
  });
  const unread = data?.items.filter((item) => !item.readAt).length ?? 0;

  const markAll = useMutation({
    mutationFn: api.auth.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative text-[#202722]"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-[#365FEA] font-mono text-[9px] font-semibold text-[#FFFEFA]">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] shadow-elevated">
            <div className="flex items-center justify-between border-b border-[#E5E1D7] px-3.5 py-2.5">
              <p className="font-heading text-xs font-bold text-[#202722]">Notifications</p>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#365FEA] hover:underline disabled:opacity-50"
                disabled={unread === 0 || markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {!data || data.items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-[#69736D]">No notifications yet.</p>
              ) : (
                data.items.slice(0, 10).map((notification) => {
                  const itemClasses = cn(
                    "block border-b border-[#E5E1D7] px-3.5 py-2.5 transition-colors last:border-0 hover:bg-[#F0EEE7]",
                    !notification.readAt && "bg-[#365FEA]/[0.05]",
                  );
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#202722]">{notification.title}</p>
                        <time className="shrink-0 font-mono text-[10px] tabular-nums text-[#69736D]">
                          {timeAgo(notification.createdAt)}
                        </time>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#69736D]">
                        {notification.body}
                      </p>
                    </>
                  );

                  return notification.link ? (
                    <Link
                      key={notification.id}
                      to={notification.link}
                      onClick={() => setOpen(false)}
                      className={itemClasses}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id} className={itemClasses}>
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const integrations = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 60_000,
  });

  const nav = useMemo(() => navFor(user?.role), [user?.role]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  const mode = integrations.data?.paypal.paymentsMode;
  const roleLabel =
    user?.role === "REVIEWER"
      ? "Verified Specialist"
      : "Requester / Agent Operator";

  return (
    <div className="min-h-dvh bg-[#F7F5EF] text-[#202722]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-13 items-center justify-between border-b border-[#E5E1D7] bg-[#FFFEFA] px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <Brand />
        </div>
        <div className="flex items-center gap-1.5">
          <NotificationBell />
        </div>
      </div>

      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[#E5E1D7] bg-[#F0EEE7] transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-[#E5E1D7] bg-[#FFFEFA] px-4">
            <Brand />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="px-3 pt-3 pb-1.5">
            <div className="rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-3 py-2 shadow-surface">
              <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#69736D]">
                Active Workspace
              </p>
              <p className="mt-0.5 truncate font-heading text-xs font-bold text-[#202722]">{roleLabel}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2" aria-label="Main">
            {nav.primary.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-[#365FEA] text-[#FFFEFA] shadow-surface"
                        : "text-[#69736D] hover:bg-[#FFFEFA] hover:text-[#202722]",
                    )
                  }
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-4">
              <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#69736D]">
                Platform
              </p>
              {nav.secondary.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-[#365FEA] text-[#FFFEFA] shadow-surface"
                          : "text-[#69736D] hover:bg-[#FFFEFA] hover:text-[#202722]",
                      )
                    }
                  >
                    <Icon className="size-3.5 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="space-y-2 border-t border-[#E5E1D7] p-2.5">
            <div className="rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-2.5 py-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#69736D]">Settlement Mode</span>
                <span className="font-mono text-[10px] font-semibold text-[#202722]">
                  {mode === "SIMULATED" ? "Simulated" : "PayPal Sandbox"}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] leading-4 text-[#69736D]">
                {mode === "SIMULATED"
                  ? "Simulated transactions · No money moves"
                  : "PayPal Sandbox checkout & payouts"}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border border-[#E5E1D7] bg-[#FFFEFA] px-2.5 py-1.5 lg:hidden">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#202722]">{user?.name}</p>
                <p className="truncate text-[10px] text-[#69736D]">{user?.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="shrink-0 text-xs text-[#CA2B2B] hover:bg-[#CA2B2B]/10"
              >
                <LogOut className="size-3.5" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-[#202722]/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop top bar */}
          <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-[#E5E1D7] bg-[#FFFEFA]/95 px-6 backdrop-blur lg:flex">
            <div className="flex items-center gap-2.5 text-xs text-[#69736D]">
              <span className="font-heading font-bold text-[#202722]">{roleLabel}</span>
              <span aria-hidden="true">·</span>
              <a
                href="/api-docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-[#202722]"
              >
                OpenAPI Reference <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-md border border-[#E5E1D7] bg-[#F7F5EF] px-2.5 py-1 text-xs transition-colors hover:bg-[#F0EEE7]"
                  aria-expanded={menuOpen}
                >
                  <span className="flex size-5 items-center justify-center rounded bg-[#365FEA]/12 font-mono text-[10px] font-semibold text-[#365FEA]">
                    {initials(user?.name ?? "TP")}
                  </span>
                  <span className="hidden max-w-36 truncate text-xs font-semibold text-[#202722] xl:block">
                    {user?.name}
                  </span>
                  <ChevronDown className="size-3.5 text-[#69736D]" />
                </button>
                {menuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[#E5E1D7] bg-[#FFFEFA] p-1 shadow-elevated">
                      <div className="border-b border-[#E5E1D7] px-3 py-2">
                        <p className="truncate text-xs font-bold text-[#202722]">{user?.name}</p>
                        <p className="truncate text-[11px] text-[#69736D]">{user?.email}</p>
                        <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase text-[#365FEA]">
                          {humanize(user?.role)}
                        </p>
                      </div>
                      <Link
                        to="/app/profile"
                        onClick={() => setMenuOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-[#202722] hover:bg-[#F0EEE7]"
                      >
                        <UserRound className="size-3.5 text-[#69736D]" /> Profile &amp; Settings
                      </Link>
                      <Link
                        to="/app/integrations"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-[#202722] hover:bg-[#F0EEE7]"
                      >
                        <Plug className="size-3.5 text-[#69736D]" /> System Integrations
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium text-[#CA2B2B] hover:bg-[#CA2B2B]/10"
                      >
                        <LogOut className="size-3.5" /> Sign out
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-[#E5E1D7] bg-[#FFFEFA] px-4 py-3 text-xs text-[#69736D] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-[#202722]">TrustToPay · Human-in-the-Loop Escalation &amp; Settlement</span>
              <span className="font-mono text-[11px]">
                {mode === "SIMULATED"
                  ? "Simulated payment mode — no money moves."
                  : "PayPal Sandbox mode — no live-money transactions."}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
