import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
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
    onError: (err) => setError(err instanceof ApiError ? err.message : "We couldn't submit your task right now."),
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
      setError("Please describe the task in at least 15 characters.");
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
        title="New task"
        description="Describe what you need help with and include supporting notes or files. We will check clarity, suggest required skills, and help you match with a specialist."
        actions={
          showForm ? (
            <Button variant="outline" onClick={closeForm}>
              <X className="size-4" /> Close form
            </Button>
          ) : (
            <Button onClick={openForm}>
              <Plus className="size-4" /> New Task
            </Button>
          )
        }
      />

      {showForm ? (
        <Card>
          <CardHeader className="border-b border-[#E5E1D7] pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="size-4 text-[#365FEA]" /> What do you need help with?
                </CardTitle>
                <p className="mt-1 text-xs text-[#69736D]">
                  Choose a category, describe your goal, and attach any helpful notes or files.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => loadExample(category)}>
                <Sparkles className="size-3.5 text-[#365FEA]" /> Use {categoryLabel(category)} sample
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={submit} className="space-y-5" noValidate>
              {error ? <Alert tone="danger">{error}</Alert> : null}

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#202722]">Category</span>
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
                            ? "border-[#365FEA] bg-[#365FEA]/[0.06] ring-1 ring-[#365FEA]/25"
                            : "border-[#E5E1D7] bg-[#FFFEFA] hover:border-[#D4CFC3]",
                        )}
                      >
                        <p className="font-display text-xs font-bold text-[#202722]">{meta.label}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#69736D]">{meta.description}</p>
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
                <Field label="Relevant tools or topics" htmlFor="session-models" hint="Optional, comma-separated">
                  <Input
                    id="session-models"
                    value={models}
                    onChange={(event) => setModels(event.target.value)}
                    placeholder="e.g. TypeScript, Billing rules, Policy review"
                    maxLength={300}
                  />
                </Field>
              </div>

              <Field
                label="Describe the task."
                htmlFor="session-question"
                required
                hint="Explain what you need help with and where things got stuck."
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
                label="What should the completed work include?"
                htmlFor="session-specs"
                hint="Optional, one detail or requirement per line"
              >
                <Textarea
                  id="session-specs"
                  value={specs}
                  onChange={(event) => setSpecs(event.target.value)}
                  rows={3}
                  maxLength={3000}
                  placeholder="List key deliverables, constraints, or questions the specialist should answer..."
                />
              </Field>

              <div className="space-y-3 border-t border-[#E5E1D7] pt-4">
                <SectionHeading
                  title={`Attach files or notes (${documents.length})`}
                  description="Share helpful excerpts, guides, or links for your specialist."
                  actions={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDocuments((prev) => [...prev, emptyDocument()])}
                    >
                      <Plus className="size-3.5" /> Add attachment
                    </Button>
                  }
                />

                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.key}
                      className="space-y-3 rounded-xl border border-[#E5E1D7] bg-[#F7F5EF] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#69736D]">
                          Attachment #{idx + 1}
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
                            placeholder="Document or note title"
                          />
                        </Field>
                        <Field label="Type" htmlFor={`${doc.key}-type`}>
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
                            <option value="OFFICIAL_MANUAL">Official Guide</option>
                            <option value="SPECIFICATION">Requirements</option>
                            <option value="VENDOR_ADVISORY">Notice or Update</option>
                            <option value="LOCAL_FILE">Code or Text File</option>
                            <option value="OTHER">Other</option>
                          </Select>
                        </Field>
                        <Field label="Link (optional)" htmlFor={`${doc.key}-url`}>
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

                      <Field label="Notes or file contents" htmlFor={`${doc.key}-content`}>
                        <Textarea
                          id={`${doc.key}-content`}
                          value={doc.content}
                          onChange={(event) =>
                            setDocuments((prev) =>
                              prev.map((d) => (d.key === doc.key ? { ...d, content: event.target.value } : d)),
                            )
                          }
                          rows={3}
                          placeholder="Paste helpful text, notes, or excerpts here..."
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5E1D7] pt-4">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" loading={create.isPending}>
                  Submit task <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        <SectionHeading
          title={`Your requests (${sessions.length})`}
          description="Open a request to review details, confirm your budget, or collect completed work."
          actions={
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#69736D]" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks…"
                className="pl-9"
              />
            </div>
          }
        />

        {query.isLoading ? (
          <LoadingBlock label="Loading your requests…" />
        ) : query.error ? (
          <ErrorState
            message={(query.error as Error)?.message ?? "We couldn't load your requests."}
            onRetry={() => query.refetch()}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            title={search ? "No matching requests" : "No requests yet"}
            description="Create a task to describe what you need help with and match with a qualified specialist."
            action={
              <Button size="sm" onClick={openForm}>
                <Plus className="size-4" /> New Task
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
      className="group block rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-4 shadow-surface transition-all hover:border-[#365FEA]/45 hover:shadow-elevated"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={session.status} />
            <Badge tone="neutral">{categoryLabel(session.category)}</Badge>
            {latest ? (
              <Badge tone="info">
                Clarity {Math.round(latest.confidenceScore * 100)}%
              </Badge>
            ) : null}
          </div>
          <h3 className="font-display text-[15px] font-bold text-[#202722] group-hover:text-[#365FEA]">
            {session.title}
          </h3>
          <p className="text-xs leading-5 text-[#69736D]">{truncate(session.question, 180)}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-xs text-[#69736D] tabular-nums">{timeAgo(session.createdAt)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#365FEA]">
            Open <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
