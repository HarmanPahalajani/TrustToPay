import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Cpu,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError, type CreateSessionInput } from "@/lib/api";
import type { AgentSession } from "@/lib/types";
import { PageHeader, SectionHeading } from "@/components/common";
import { StatusBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui/states";
import {
  CATEGORY_EXAMPLES,
  CATEGORY_META,
  CATEGORY_VALUES,
  DEFAULT_CATEGORY,
  type CategoryValue,
  categoryLabel,
} from "@/lib/categories";
import { timeAgo, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

type DocumentDraft = {
  key: string;
  title: string;
  url: string;
  publisher: string;
  sourceType: CreateSessionInput["documents"][number]["sourceType"];
  content: string;
};

function makeKey() {
  return `doc_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyDocument(): DocumentDraft {
  return {
    key: makeKey(),
    title: "",
    url: "",
    publisher: "",
    sourceType: "DOCUMENT",
    content: "",
  };
}

export default function WorkspacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState<CategoryValue>(DEFAULT_CATEGORY);
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [models, setModels] = useState("");
  const [specs, setSpecs] = useState("");
  const [documents, setDocuments] = useState<DocumentDraft[]>([emptyDocument()]);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["sessions", { search }],
    queryFn: () => api.sessions.list({ q: search || undefined, pageSize: 50 }),
  });

  const create = useMutation({
    mutationFn: (input: CreateSessionInput) => api.sessions.create(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(`/app/sessions/${data.session.id}`);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create agent session."),
  });

  function loadExample(nextCategory: CategoryValue = category) {
    const example = CATEGORY_EXAMPLES[nextCategory];
    setCategory(nextCategory);
    setTitle(example.title);
    setQuestion(example.question);
    setModels(example.productModels.join(", "));
    setSpecs(example.specifications.join("\n"));
    setDocuments(
      example.documents.map((document) => ({
        key: makeKey(),
        title: document.title,
        url: document.url,
        publisher: document.publisher,
        sourceType: document.sourceType,
        content: document.content,
      })),
    );
    setError(null);
  }

  function openForm() {
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (question.trim().length < 15) {
      setError("Question must be at least 15 characters.");
      return;
    }
    const cleanedDocuments = documents
      .filter((document) => document.title.trim() && document.content.trim())
      .map((document) => ({
        title: document.title.trim(),
        url: document.url.trim() || null,
        publisher: document.publisher.trim() || null,
        sourceType: document.sourceType,
        content: document.content.trim(),
      }));
    create.mutate({
      title: title.trim() || undefined,
      category,
      question: question.trim(),
      productModels: models
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      specifications: specs
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
      documents: cleanedDocuments,
    });
  }

  const sessions = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create a task when your AI gets stuck"
        description="Submit the blocker and supporting notes. TrustToPay checks confidence, identifies matching specialists, and prepares a clear review task."
        actions={
          showForm ? (
            <Button variant="outline" onClick={closeForm}>
              <X className="size-4" /> Close form
            </Button>
          ) : (
            <Button onClick={openForm}>
              <Plus className="size-4" /> New Request
            </Button>
          )
        }
      />

      {showForm ? (
        <Card>
          <CardHeader className="border-b border-[#E4E9F2] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="size-4 text-[#4263EB]" /> Create escalation session
                </CardTitle>
                <p className="mt-1 text-xs text-[#68738A]">
                  Select a domain template or supply custom specifications and evidence documents.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => loadExample(category)}>
                <Sparkles className="size-3.5 text-[#4263EB]" /> Load {categoryLabel(category)} example
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={submit} className="space-y-5" noValidate>
              {error ? <Alert tone="danger">{error}</Alert> : null}

              {/* Category selector pills */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#141B2D]">Task Category</span>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {CATEGORY_VALUES.map((val) => {
                    const meta = CATEGORY_META[val];
                    const selected = category === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCategory(val)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          selected
                            ? "border-[#4263EB] bg-[#4263EB]/[0.06] ring-1 ring-[#4263EB]/25"
                            : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#CBD5E1]",
                        )}
                      >
                        <p className="font-display text-xs font-bold text-[#141B2D]">{meta.label}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#68738A]">{meta.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Short title" htmlFor="session-title" hint="Optional concise summary">
                  <Input
                    id="session-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={CATEGORY_EXAMPLES[category].title}
                    maxLength={140}
                  />
                </Field>
                <Field label="Target models / systems" htmlFor="session-models" hint="Comma-separated">
                  <Input
                    id="session-models"
                    value={models}
                    onChange={(event) => setModels(event.target.value)}
                    placeholder="e.g. Node 20, PostgreSQL 16, Redis 7"
                    maxLength={300}
                  />
                </Field>
              </div>

              <Field
                label="Question or agent blocker"
                htmlFor="session-question"
                required
                hint="Describe where the agent stopped, what conflict exists, and what must be confirmed."
              >
                <Textarea
                  id="session-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={4}
                  maxLength={5000}
                  placeholder={CATEGORY_EXAMPLES[category].question}
                />
              </Field>

              <Field
                label="Specifications & runtime constraints"
                htmlFor="session-specs"
                hint="One constraint or assertion per line"
              >
                <Textarea
                  id="session-specs"
                  value={specs}
                  onChange={(event) => setSpecs(event.target.value)}
                  rows={3}
                  maxLength={3000}
                  placeholder="Optional runtime constraints, version pins, or policy rules..."
                />
              </Field>

              {/* Evidence Documents */}
              <div className="space-y-3 border-t border-[#E4E9F2] pt-4">
                <SectionHeading
                  title={`Evidence documents (${documents.length})`}
                  description="Attach official specifications, source files, or error excerpts."
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDocuments((prev) => [...prev, emptyDocument()])}
                    >
                      <Plus className="size-3.5" /> Add evidence
                    </Button>
                  }
                />

                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.key}
                      className="space-y-3 rounded-xl border border-[#E4E9F2] bg-[#F5F7FC] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[#68738A]">
                          Document #{idx + 1}
                        </span>
                        {documents.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => setDocuments((prev) => prev.filter((item) => item.key !== doc.key))}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#E5484D] hover:bg-[#E5484D]/10"
                          >
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Title" htmlFor={`${doc.key}-title`}>
                          <Input
                            id={`${doc.key}-title`}
                            value={doc.title}
                            onChange={(event) =>
                              setDocuments((prev) =>
                                prev.map((d) => (d.key === doc.key ? { ...d, title: event.target.value } : d)),
                              )
                            }
                            placeholder="Spec or log title"
                          />
                        </Field>
                        <Field label="Source type" htmlFor={`${doc.key}-type`}>
                          <Select
                            id={`${doc.key}-type`}
                            value={doc.sourceType}
                            onChange={(event) =>
                              setDocuments((prev) =>
                                prev.map((d) =>
                                  d.key === doc.key
                                    ? {
                                        ...d,
                                        sourceType: event.target.value as DocumentDraft["sourceType"],
                                      }
                                    : d,
                                ),
                              )
                            }
                          >
                            <option value="OFFICIAL_MANUAL">Official Manual</option>
                            <option value="SPECIFICATION">Specification</option>
                            <option value="VENDOR_ADVISORY">Vendor Advisory</option>
                            <option value="LOCAL_FILE">Source File / Diff</option>
                            <option value="OTHER">Other</option>
                          </Select>
                        </Field>
                        <Field label="Reference URL" htmlFor={`${doc.key}-url`}>
                          <Input
                            id={`${doc.key}-url`}
                            value={doc.url}
                            onChange={(event) =>
                              setDocuments((prev) =>
                                prev.map((d) => (d.key === doc.key ? { ...d, url: event.target.value } : d)),
                              )
                            }
                            placeholder="https://..."
                          />
                        </Field>
                      </div>

                      <Field label="Document excerpt or log payload" htmlFor={`${doc.key}-content`}>
                        <Textarea
                          id={`${doc.key}-content`}
                          value={doc.content}
                          onChange={(event) =>
                            setDocuments((prev) =>
                              prev.map((d) => (d.key === doc.key ? { ...d, content: event.target.value } : d)),
                            )
                          }
                          rows={3}
                          placeholder="Paste relevant specification paragraphs, error traces, or file excerpts..."
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E4E9F2] pt-4">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" loading={create.isPending}>
                  Create &amp; Analyze Session <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {/* Sessions list & filter */}
      <div className="space-y-4">
        <SectionHeading
          title={`AI Requests (${sessions.length})`}
          description="Select a request to inspect analysis results, create a specialist task, or collect verified answers."
          actions={
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68738A]" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sessions…"
                className="pl-9"
              />
            </div>
          }
        />

        {query.isLoading ? (
          <LoadingBlock label="Loading agent sessions…" />
        ) : query.error ? (
          <ErrorState
            message={(query.error as Error)?.message ?? "Could not fetch sessions."}
            onRetry={() => query.refetch()}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            title={search ? "No matching sessions" : "No agent sessions yet"}
            description="Create a session to capture a technical blocker, attach specifications, and run confidence analysis."
            action={
              <Button size="sm" onClick={openForm}>
                <Plus className="size-4" /> Create first session
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: AgentSession }) {
  const latest = session.analysisRuns?.[0];
  return (
    <Link
      to={`/app/sessions/${session.id}`}
      className="group block rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-4 shadow-surface transition-all hover:border-[#4263EB]/45 hover:shadow-elevated"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={session.status} />
            <Badge tone="neutral">{categoryLabel(session.category)}</Badge>
            {latest ? (
              <Badge tone="info">
                Confidence {Math.round(latest.confidenceScore * 100)}%
              </Badge>
            ) : null}
          </div>
          <h3 className="font-display text-[15px] font-bold text-[#141B2D] group-hover:text-[#4263EB]">
            {session.title}
          </h3>
          <p className="text-xs leading-5 text-[#68738A]">{truncate(session.question, 180)}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-xs text-[#68738A] tabular-nums">{timeAgo(session.createdAt)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4263EB]">
            Open <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
