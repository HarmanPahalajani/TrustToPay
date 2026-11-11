import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { humanize, initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

function navFor(role: string | undefined): { primary: NavItem[]; secondary: NavItem[] } {
  if (role === "REVIEWER") {
    return {
      primary: [
        { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/app/marketplace", label: "Marketplace & Offers", icon: BriefcaseBusiness },
        { to: "/app/reviews", label: "My Active Tasks", icon: Inbox },
        { to: "/app/onboarding/skills", label: "Skill Verification", icon: Award },
        { to: "/app/earnings", label: "Earnings & Payouts", icon: Wallet },
        { to: "/app/payments", label: "Payment Ledger", icon: CreditCard },
      ],
      secondary: [
        { to: "/app/profile", label: "Settings & Profile", icon: UserRound },
        { to: "/app/docs", label: "Documentation", icon: BookOpen },
        { to: "/app/integrations", label: "Integrations", icon: Plug },
      ],
    };
  }

  return {
    primary: [
      { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/app/workspace", label: "Agent Workspace", icon: Sparkles },
      { to: "/app/requests", label: "Escalated Tasks", icon: Inbox },
      { to: "/app/payments", label: "Payments & Escrow", icon: CreditCard },
    ],
    secondary: [
      { to: "/app/integrations", label: "Integrations & Keys", icon: Plug },
      { to: "/app/docs", label: "API & MCP Docs", icon: BookOpen },
      { to: "/app/profile", label: "Settings & Profile", icon: UserRound },
    ],
  };
}

function NotificationsBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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

  const markOne = useMutation({
    mutationFn: (id: string) => api.auth.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <Bell className="size-4 text-[#141B2D]" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#4263EB] font-mono text-[9px] font-bold text-white tabular-nums">
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
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] shadow-elevated sm:w-96">
            <div className="flex items-center justify-between border-b border-[#E4E9F2] bg-[#F5F7FC] px-4 py-3">
              <div>
                <p className="font-display text-xs font-bold text-[#141B2D]">Notifications</p>
                <p className="text-[11px] text-[#68738A]">{unread} unread update{unread === 1 ? "" : "s"}</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-[#4263EB] hover:bg-[#4263EB]/10 disabled:opacity-50"
                disabled={unread === 0 || markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            </div>

            <div className="max-h-96 divide-y divide-[#E4E9F2] overflow-y-auto">
              {!data || data.items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto mb-2 size-5 text-[#94A3B8]" />
                  <p className="text-xs font-medium text-[#68738A]">No notifications recorded yet.</p>
                </div>
              ) : (
                data.items.slice(0, 12).map((notification) => {
                  const isUnread = !notification.readAt;
                  const inner = (
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-[#141B2D]">{notification.title}</p>
                        <span className="shrink-0 font-mono text-[10px] text-[#68738A]">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-4 text-[#4E596E]">{notification.body}</p>
                    </div>
                  );

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-[#F5F7FC]",
                        isUnread && "bg-[#4263EB]/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          isUnread ? "bg-[#4263EB]" : "bg-[#E4E9F2]",
                        )}
                      />
                      {notification.link ? (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            if (isUnread) markOne.mutate(notification.id);
                            setOpen(false);
                          }}
                          className="min-w-0 flex-1"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="min-w-0 flex-1">{inner}</div>
                      )}
                      {isUnread ? (
                        <button
                          type="button"
                          aria-label="Mark notification read"
                          onClick={() => markOne.mutate(notification.id)}
                          className="mt-0.5 rounded p-1 text-[#68738A] hover:bg-[#EDF0F6] hover:text-[#141B2D]"
                        >
                          <Check className="size-3.5" />
                        </button>
                      ) : null}
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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const integration = useQuery({
    queryKey: ["integrations", "status"],
    queryFn: api.integrations.status,
    staleTime: 60_000,
  });

  const nav = useMemo(() => navFor(user?.role), [user?.role]);

  async function handleLogout() {
    setSidebarOpen(false);
    await logout();
    navigate("/");
  }

  const paypalMode = integration.data?.paypal.paymentsMode;
  const aiEngine = integration.data?.ai.engine;

  const railContent = (
    <div className="flex h-full flex-col justify-between bg-[#10172A] px-3 py-5 text-[#CBD5E1]">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <Brand tone="inverse" to="/app" />
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav aria-label="Workspace primary" className="space-y-1">
          <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            {user?.role === "REVIEWER" ? "Specialist Workbench" : "Requester Operations"}
          </p>
          {nav.primary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#4263EB] font-semibold text-white"
                      : "text-[#CBD5E1] hover:bg-[#1B2541] hover:text-white",
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <nav aria-label="Workspace secondary" className="space-y-1">
          <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Configuration
          </p>
          {nav.secondary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#1B2541] font-semibold text-white"
                      : "text-[#94A3B8] hover:bg-[#1B2541] hover:text-white",
                  )
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-[#1E293B] pt-4">
        {user ? (
          <div className="flex items-center gap-2.5 rounded-lg bg-[#162038] p-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#4263EB] font-display text-xs font-bold text-white">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate font-mono text-[10px] text-[#94A3B8]">
                {user.role === "REVIEWER" ? "Specialist" : "Requester"} · {humanize(user.role)}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#CBD5E1] transition-colors hover:bg-[#1B2541] hover:text-white"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      {/* Fixed desktop left rail */}
      <aside className="hidden w-64 shrink-0 border-r border-[#1E293B] lg:block">{railContent}</aside>

      {/* Mobile slide-over drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 bg-[#10172A]/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] shrink-0 shadow-elevated">{railContent}</aside>
        </div>
      ) : null}

      {/* Main workspace column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#E4E9F2] bg-[#FFFFFF] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open workspace navigation"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] hover:bg-[#EDF0F6] lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {paypalMode ? (
                <Badge tone={paypalMode === "SIMULATED" ? "warning" : "info"} dot>
                  {paypalMode === "SIMULATED" ? "Simulated Escrow" : "PayPal Sandbox"}
                </Badge>
              ) : null}
              {aiEngine ? (
                <Badge tone="neutral">
                  <ShieldCheck className="size-3 text-[#12A875]" />
                  {aiEngine === "demo" ? "Deterministic Analyzer" : `AI: ${humanize(aiEngine)}`}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user?.role === "REQUESTER" ? (
              <Button asChild size="sm">
                <Link to="/app/workspace">New Escalation</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/app/marketplace">Browse Marketplace</Link>
              </Button>
            )}
            <NotificationsBell />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
