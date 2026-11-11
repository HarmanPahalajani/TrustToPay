import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Filter,
  Inbox,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, SectionHeading } from "@/components/common";
import { TaskRowCard } from "@/components/task-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { CATEGORY_VALUES, categoryLabel } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { taskStatusLabel } from "@/lib/status-labels";

type Mode = "marketplace" | "reviews" | "requests";

const MODE_COPY: Record<
  Mode,
  { title: string; description: string; emptyTitle: string; emptyBody: string }
> = {
  marketplace: {
    title: "Available tasks",
    description:
      "Browse paid tasks matched to your skills. Accept an invitation or claim an open task to begin.",
    emptyTitle: "No open tasks match your filters",
    emptyBody: "Clear your filters or check back soon as new tasks arrive.",
  },
  reviews: {
    title: "My active tasks",
    description:
      "Manage the tasks you have accepted, submit your work and notes, and follow safety review progress.",
    emptyTitle: "You have no active tasks yet",
    emptyBody: "Accept an invitation or claim an available task to get started.",
  },
  requests: {
    title: "My tasks",
    description:
      "Track specialist matching, complete payment, follow safety checks, and collect finished work.",
    emptyTitle: "You have not created a task yet",
    emptyBody: "Create a task to describe what you need help with and match with a specialist.",
  },
};

const STATUS_OPTIONS = [
  "AWAITING_FUNDING",
  "PAYMENT_READY",
  "REVIEWER_ASSIGNED",
  "VERIFICATION_PENDING",
  "VERIFIED",
  "PAYMENT_PAID",
  "NEEDS_REVISION",
  "DISPUTED",
  "CANCELLED",
];

export default function TaskBrowserPage({ mode }: { mode: Mode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"newest" | "reward_desc" | "reward_asc">("newest");
  const [fundedOnly, setFundedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [offerNotice, setOfferNotice] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["tasks", mode, { page, search, category, status, sort }],
    queryFn: () =>
      api.tasks.list({
        page,
        pageSize: 15,
        q: search.trim() || undefined,
        category: category || undefined,
        status: status || undefined,
        sort,
        scope: mode === "reviews" ? "assigned" : mode === "requests" ? "requested" : "available",
      }),
  });

  const acceptOffer = useMutation({
    mutationFn: (taskId: string) => api.tasks.accept(taskId),
    onSuccess: async () => {
      setOfferNotice("Task accepted and added to your active tasks.");
      setOfferError(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => setOfferError(err instanceof ApiError ? err.message : "Could not accept task."),
  });

  const declineOffer = useMutation({
    mutationFn: (taskId: string) => api.tasks.declineOffer(taskId),
    onSuccess: async () => {
      setOfferNotice("Invitation declined.");
      setOfferError(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => setOfferError(err instanceof ApiError ? err.message : "Could not decline invitation."),
  });

  const copy = MODE_COPY[mode];
  const rawItems = query.data?.items ?? [];
  const items = fundedOnly ? rawItems.filter((task) => Boolean(task.fundedAt)) : rawItems;
  const pendingOffers = rawItems.filter((task) => task.myOffer?.status === "PENDING");
  const pagination = query.data?.pagination;

  const hasFilters = Boolean(search || category || status || fundedOnly);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setStatus("");
    setFundedOnly(false);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          mode === "requests" ? (
            <Button asChild>
              <Link to="/app/workspace">New Task</Link>
            </Button>
          ) : mode === "marketplace" ? (
            <Button asChild variant="outline">
              <Link to="/app/onboarding/skills">
                <Award className="size-4" /> Skill Verification
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/app/marketplace">Browse Available Tasks</Link>
            </Button>
          )
        }
      />

      {offerNotice ? <Alert tone="success">{offerNotice}</Alert> : null}
      {offerError ? <Alert tone="danger">{offerError}</Alert> : null}

      {mode === "marketplace" && pendingOffers.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading
            title={`Invitations for you (${pendingOffers.length})`}
            description="Tasks matched to your verified skills and availability."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {pendingOffers.map((task) => {
              const offer = task.myOffer!;
              return (
                <Card key={offer.id} className="border-[#365FEA]/35 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge tone="cobalt" dot>
                        Invited
                      </Badge>
                      <Badge tone="indigo">
                        <Sparkles className="size-3" /> {Math.round(offer.score * 100)}% Match
                      </Badge>
                    </div>
                    <span className="text-base font-bold text-[#202722] tabular-nums">
                      {formatMoney(task.rewardMinor, task.currency)}
                    </span>
                  </div>
                  <Link
                    to={`/app/tasks/${task.id}`}
                    className="mt-2.5 block font-heading text-base font-semibold text-[#202722] hover:text-[#365FEA]"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#69736D]">{task.question}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E5E1D7] pt-3">
                    <Button
                      size="sm"
                      onClick={() => acceptOffer.mutate(task.id)}
                      loading={acceptOffer.isPending}
                    >
                      <CheckCircle2 className="size-3.5" /> Accept task
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineOffer.mutate(task.id)}
                      loading={declineOffer.isPending}
                    >
                      <XCircle className="size-3.5" /> Decline
                    </Button>
                    <Link
                      to={`/app/tasks/${task.id}`}
                      className="ml-auto text-xs font-semibold text-[#365FEA] hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#69736D]" />
              <Input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, requirements, or category…"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
                className="w-44"
                aria-label="Sort tasks"
              >
                <option value="newest">Newest first</option>
                <option value="reward_desc">Highest budget</option>
                <option value="reward_asc">Lowest budget</option>
              </Select>
              <Button variant="outline" size="default" onClick={() => setFiltersOpen((v) => !v)}>
                <Filter className="size-4" /> Filters
              </Button>
              {hasFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Reset
                </Button>
              ) : null}
            </div>
          </div>

          {filtersOpen ? (
            <div className="grid gap-3 border-t border-[#E5E1D7] pt-3 sm:grid-cols-3">
              <Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                aria-label="Category filter"
              >
                <option value="">All categories</option>
                {CATEGORY_VALUES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </Select>

              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                aria-label="Status filter"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {taskStatusLabel(s)}
                  </option>
                ))}
              </Select>

              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#E5E1D7] bg-[#F7F5EF] px-3 text-xs font-medium text-[#202722]">
                <input
                  type="checkbox"
                  checked={fundedOnly}
                  onChange={(event) => {
                    setFundedOnly(event.target.checked);
                    setPage(1);
                  }}
                  className="size-4 accent-[#365FEA]"
                />
                <span>Paid tasks only</span>
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {query.isLoading ? (
        <LoadingBlock label="Loading tasks…" />
      ) : query.error ? (
        <ErrorState
          message={(query.error as Error)?.message ?? "We couldn't load tasks right now."}
          onRetry={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
          action={
            hasFilters ? (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : user?.role === "REQUESTER" ? (
              <Button asChild size="sm">
                <Link to="/app/workspace">New Task</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((task) => (
            <TaskRowCard key={task.id} task={task} showRequester={mode !== "requests"} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-[#E5E1D7] pt-4 text-xs text-[#69736D]">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft className="size-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
