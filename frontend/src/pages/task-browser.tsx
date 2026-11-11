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
import { PaymentModeBanner } from "@/components/payment-mode-banner";
import { TaskRowCard } from "@/components/task-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import { CATEGORY_VALUES, categoryLabel } from "@/lib/categories";
import { formatMoney, humanize } from "@/lib/format";

type Mode = "marketplace" | "reviews" | "requests";

const MODE_COPY: Record<
  Mode,
  { eyebrow: string; title: string; description: string; emptyTitle: string; emptyBody: string }
> = {
  marketplace: {
    eyebrow: "Specialist Marketplace",
    title: "Funded escalations matched to your skills",
    description:
      "Tasks enter the specialist pool only after escrow funding is captured. Review top-5 targeted offers or claim open matching requests.",
    emptyTitle: "No open tasks match your filters",
    emptyBody: "Clear filters or wait for new funded tasks from AI agent workflows.",
  },
  reviews: {
    eyebrow: "Specialist Workbench",
    title: "Your claimed tasks and verification results",
    description:
      "Every assignment, artifact upload, verification run, and payout ledger entry for tasks you claimed.",
    emptyTitle: "You have not claimed a task yet",
    emptyBody: "Accept a targeted offer or claim a funded task from the Marketplace.",
  },
  requests: {
    eyebrow: "Requester Tasks",
    title: "Escalated tasks from your AI agents",
    description:
      "Track Elastic + Jina matching progress, fund open tasks via PayPal, inspect independent security scans, and resume blocked sessions.",
    emptyTitle: "You have not created a review task",
    emptyBody: "Submit a blocker in the Agent Workspace and escalate it after running analysis.",
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
      setOfferNotice("Offer claimed and assigned to your active workbench.");
      setOfferError(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => setOfferError(err instanceof ApiError ? err.message : "Could not accept offer."),
  });

  const declineOffer = useMutation({
    mutationFn: (taskId: string) => api.tasks.declineOffer(taskId),
    onSuccess: async () => {
      setOfferNotice("Offer declined.");
      setOfferError(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => setOfferError(err instanceof ApiError ? err.message : "Could not decline offer."),
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
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          mode === "requests" ? (
            <Button asChild>
              <Link to="/app/workspace">Open Agent Workspace</Link>
            </Button>
          ) : mode === "marketplace" ? (
            <Button asChild variant="outline">
              <Link to="/app/onboarding/skills">
                <Award className="size-4" /> My Certified Skills
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/app/marketplace">Browse Marketplace</Link>
            </Button>
          )
        }
      />

      <PaymentModeBanner compact />
      {offerNotice ? <Alert tone="success">{offerNotice}</Alert> : null}
      {offerError ? <Alert tone="danger">{offerError}</Alert> : null}

      {/* Top-5 Targeted Specialist Offers */}
      {mode === "marketplace" && pendingOffers.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading
            eyebrow="Top-5 Ranked Dispatch"
            title={`Pending direct offers (${pendingOffers.length})`}
            description="Selected via Jina AI + Elasticsearch similarity and PostgreSQL skill verification."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {pendingOffers.map((task) => {
              const offer = task.myOffer!;
              return (
                <Card key={offer.id} className="border-[#4263EB]/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge tone="cobalt" dot>
                        Rank #{offer.rank}
                      </Badge>
                      <Badge tone="indigo">
                        <Sparkles className="size-3" /> {Math.round(offer.score * 100)}% Match
                      </Badge>
                    </div>
                    <span className="font-display text-sm font-bold text-[#141B2D] tabular-nums">
                      {formatMoney(task.rewardMinor, task.currency)}
                    </span>
                  </div>
                  <Link
                    to={`/app/tasks/${task.id}`}
                    className="mt-2.5 block font-display text-sm font-bold text-[#141B2D] hover:text-[#4263EB]"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#68738A]">{task.question}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E4E9F2] pt-3">
                    <Button
                      size="sm"
                      onClick={() => acceptOffer.mutate(task.id)}
                      loading={acceptOffer.isPending}
                    >
                      <CheckCircle2 className="size-3.5" /> Accept Offer
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
                      className="ml-auto text-xs font-semibold text-[#4263EB] hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Search & Filters */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68738A]" />
              <Input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, criteria, or domain…"
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
                <option value="reward_desc">Highest reward</option>
                <option value="reward_asc">Lowest reward</option>
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
            <div className="grid gap-3 border-t border-[#E4E9F2] pt-3 sm:grid-cols-3">
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
                    {humanize(s)}
                  </option>
                ))}
              </Select>

              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#E4E9F2] bg-[#F5F7FC] px-3 text-xs font-medium text-[#141B2D]">
                <input
                  type="checkbox"
                  checked={fundedOnly}
                  onChange={(event) => {
                    setFundedOnly(event.target.checked);
                    setPage(1);
                  }}
                  className="size-4 accent-[#4263EB]"
                />
                <span>Funded only</span>
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Task Results */}
      {query.isLoading ? (
        <LoadingBlock label="Loading tasks…" />
      ) : query.error ? (
        <ErrorState
          message={(query.error as Error)?.message ?? "Could not fetch tasks."}
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
                <Link to="/app/workspace">Open Agent Workspace</Link>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-[#E4E9F2] pt-4 text-xs text-[#68738A]">
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
