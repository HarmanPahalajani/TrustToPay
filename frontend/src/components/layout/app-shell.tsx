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
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { initials, timeAgo } from "@/lib/format";
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
        { to: "/app/marketplace", label: "Available Tasks", icon: BriefcaseBusiness },
        { to: "/app/reviews", label: "My Active Tasks", icon: Inbox },
        { to: "/app/onboarding/skills", label: "Skill Verification", icon: Award },
        { to: "/app/earnings", label: "Earnings", icon: Wallet },
        { to: "/app/payments", label: "Payment History", icon: CreditCard },
      ],
      secondary: [
        { to: "/app/profile", label: "Profile & Settings", icon: UserRound },
        { to: "/app/docs", label: "API & MCP Docs", icon: BookOpen },
      ],
    };
  }

  return {
    primary: [
      { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/app/workspace", label: "AI Workspace", icon: Sparkles },
      { to: "/app/requests", label: "My Tasks", icon: Inbox },
      { to: "/app/payments", label: "Payments", icon: CreditCard },
    ],
    secondary: [
      { to: "/app/docs", label: "API & MCP Docs", icon: BookOpen },
      { to: "/app/profile", label: "Profile & Settings", icon: UserRound },
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
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex size-10 items-center justify-center rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] shadow-surface transition-colors hover:bg-[#EDF0F6]"
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4263EB] px-1 text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] shadow-elevated sm:w-96">
            <div className="flex items-center justify-between border-b border-[#E4E9F2] px-4 py-3">
              <span className="font-display text-xs font-bold text-[#141B2D]">Notifications</span>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4263EB] hover:text-[#3451D1]"
                >
                  <CheckCheck className="size-3.5" /> Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-80 divide-y divide-[#E4E9F2] overflow-y-auto">
              {(data?.items.length ?? 0) === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-[#68738A]">
                  No notifications yet. Activity updates appear here.
                </p>
              ) : (
                data?.items.map((item) => {
                  const isUnread = !item.readAt;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start justify-between gap-3 px-4 py-3 text-xs",
                        isUnread && "bg-[#4263EB]/[0.04]",
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        {item.link ? (
                          <Link
                            to={item.link}
                            onClick={() => {
                              setOpen(false);
                              if (isUnread) markOne.mutate(item.id);
                            }}
                            className="block font-semibold text-[#141B2D] hover:text-[#4263EB]"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p className="font-semibold text-[#141B2D]">{item.title}</p>
                        )}
                        <p className="leading-5 text-[#4E596E]">{item.body}</p>
                        <p className="text-[11px] text-[#68738A] tabular-nums">{timeAgo(item.createdAt)}</p>
                      </div>
                      {isUnread ? (
                        <button
                          type="button"
                          aria-label="Mark notification read"
                          onClick={() => markOne.mutate(item.id)}
                          className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-[#E4E9F2] bg-[#FFFFFF] text-[#4E596E] hover:border-[#4263EB] hover:text-[#4263EB]"
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

  const nav = useMemo(() => navFor(user?.role), [user?.role]);

  async function handleLogout() {
    setSidebarOpen(false);
    await logout();
    navigate("/");
  }

  const railContent = (
    <div className="flex h-full flex-col justify-between bg-[#10172A] px-3 py-5 text-[#CBD5E1]">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <Brand tone="inverse" to="/app" />
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav aria-label="Workspace primary" className="space-y-1">
          <p className="px-3 pb-1.5 text-xs font-medium text-[#94A3B8]">
            {user?.role === "REVIEWER" ? "Specialist Workspace" : "Requester Workspace"}
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
                    "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
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

        <nav aria-label="Workspace secondary" className="space-y-1 border-t border-[#1E293B] pt-4">
          <p className="px-3 pb-1.5 text-xs font-medium text-[#94A3B8]">Account &amp; Reference</p>
          {nav.secondary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
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
              <p className="truncate text-[11px] text-[#94A3B8]">
                {user.role === "REVIEWER" ? "Human Specialist" : "AI Requester"}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium text-[#CBD5E1] transition-colors hover:bg-[#1B2541] hover:text-white"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-[#F5F7FC] text-[#141B2D]">
      <aside className="hidden w-64 shrink-0 border-r border-[#1E293B] lg:block">{railContent}</aside>

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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#E4E9F2] bg-[#FFFFFF] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open workspace navigation"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] hover:bg-[#EDF0F6] lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold text-[#141B2D] lg:hidden">TrustToPay</span>
          </div>

          <div className="flex items-center gap-2.5">
            {user?.role === "REQUESTER" ? (
              <Button asChild size="default">
                <Link to="/app/workspace">New Task Request</Link>
              </Button>
            ) : (
              <Button asChild size="default" variant="outline">
                <Link to="/app/marketplace">Browse Tasks</Link>
              </Button>
            )}
            <NotificationsBell />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
