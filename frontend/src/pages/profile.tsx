import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Lock,
  Mail,
  Play,
  Save,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { SkillAssessmentAttemptResult, SkillAssessmentQuestion } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, SectionHeading, DataRow } from "@/components/common";
import { SkillLevelBadge } from "@/components/status-badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { LoadingBlock } from "@/components/ui/states";
import { formatDate, humanize } from "@/lib/format";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [headline, setHeadline] = useState(user?.profile?.headline ?? "");
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [payoutEmail, setPayoutEmail] = useState(user?.profile?.payoutEmail ?? "");
  const [consent, setConsent] = useState(user?.profile?.payoutConsent ?? false);
  const [timezone, setTimezone] = useState(user?.profile?.timezone ?? "UTC");

  // Active sequential assessment state
  const [activeAttempt, setActiveAttempt] = useState<{
    id: string;
    skillName: string;
    level: number;
    levelName: string;
    passingScore: number;
    questions: SkillAssessmentQuestion[];
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<SkillAssessmentAttemptResult | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setHeadline(user.profile?.headline ?? "");
    setBio(user.profile?.bio ?? "");
    setPayoutEmail(user.profile?.payoutEmail ?? "");
    setConsent(user.profile?.payoutConsent ?? false);
    setTimezone(user.profile?.timezone ?? "UTC");
  }, [user]);

  const reviewerDashboard = useQuery({
    queryKey: ["dashboard", "reviewer"],
    queryFn: api.dashboards.reviewer,
    enabled: user?.role === "REVIEWER",
  });

  const skillsCatalog = useQuery({
    queryKey: ["skills", "catalog"],
    queryFn: api.skills.list,
    enabled: Boolean(user),
  });

  const startAssessment = useMutation({
    mutationFn: ({ skillId, level }: { skillId: string; level: number }) =>
      api.skills.startAssessment(skillId, level),
    onSuccess: (data) => {
      setAssessmentError(null);
      setAssessmentResult(null);
      const initialAnswers: Record<string, string> = {};
      for (const q of data.questions) {
        if (q.type === "CODE_TASK" && q.starterCode) {
          initialAnswers[q.id] = q.starterCode;
        }
      }
      setAnswers(initialAnswers);
      setActiveAttempt({
        id: data.attempt.id,
        skillName: data.attempt.skillName,
        level: data.attempt.level,
        levelName: data.attempt.levelName,
        passingScore: data.attempt.passingScore,
        questions: data.questions,
      });
    },
    onError: (err) => {
      setAssessmentError(err instanceof ApiError ? err.message : "Could not start skill assessment.");
    },
  });

  const submitAssessment = useMutation({
    mutationFn: () => {
      if (!activeAttempt) throw new Error("No active assessment");
      return api.skills.submitAttempt(activeAttempt.id, answers);
    },
    onSuccess: async (data) => {
      setAssessmentError(null);
      setAssessmentResult(data.attempt);
      setActiveAttempt(null);
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      setAssessmentError(err instanceof ApiError ? err.message : "Could not submit skill assessment.");
    },
  });

  const save = useMutation({
    mutationFn: () =>
      api.users.updatePayout({
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        payoutEmail: payoutEmail.trim() || null,
        payoutConsent: consent,
        timezone: timezone.trim() || "UTC",
      }),
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSaved("Your profile was saved.");
      setError(null);
    },
    onError: (err) => {
      setSaved(null);
      setError(err instanceof ApiError ? err.message : "Could not save your profile.");
    },
  });

  if (!user) return <LoadingBlock label="Loading your profile..." />;

  const reviewer = user.role === "REVIEWER";
  const ready = Boolean(payoutEmail.trim() && consent);
  const stats = reviewerDashboard.data;
  const verifiedSkills = user.skills ?? [];

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(null);
    setError(null);
    if (consent && !payoutEmail.trim()) {
      setError("Record a PayPal payout email before giving consent.");
      return;
    }
    if (payoutEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payoutEmail.trim())) {
      setError("Enter a valid PayPal email address.");
      return;
    }
    save.mutate();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={reviewer ? "Specialist profile & payout details" : "Your profile"}
        description={
          reviewer
            ? "Verified skills are earned step by step through short assessments. Add a PayPal email and confirm consent to receive payouts when rewards are released."
            : "Manage your account details used across tasks and team reviews."
        }
        actions={
          reviewer ? (
            <Button asChild variant="outline">
              <Link to="/app/earnings">
                <Wallet className="size-4" /> Earnings
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="space-y-5">
          {error ? <Alert tone="danger">{error}</Alert> : null}
          {saved ? (
            <Alert tone="success" icon={<CheckCircle2 className="size-4" />}>
              {saved}
            </Alert>
          ) : null}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserRound className="size-4 text-primary" /> Public profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" htmlFor="profile-name" hint="Contact support to change your name.">
                  <Input id="profile-name" value={user.name} readOnly disabled />
                </Field>
                <Field label="Email" htmlFor="profile-email" hint="Used to sign in.">
                  <Input id="profile-email" value={user.email} readOnly disabled />
                </Field>
              </div>
              <Field
                label="Headline"
                htmlFor="profile-headline"
                hint="Short summary shown on your reviewer profile. Max 160 characters."
              >
                <Input
                  id="profile-headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Software, crypto or hardware specialist"
                  maxLength={160}
                />
              </Field>
              <Field
                label="Bio"
                htmlFor="profile-bio"
                hint="Describe the evidence you normally use and the questions you can verify."
              >
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="I verify power-delivery claims against manufacturer documentation and per-port limits."
                />
              </Field>
              <Field label="Timezone" htmlFor="profile-timezone" hint="Used for display only. Example: Europe/London.">
                <Input
                  id="profile-timezone"
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="UTC"
                  maxLength={80}
                />
              </Field>

              {reviewer ? (
                <div className="space-y-3 pt-1">
                  <SectionHeading
                    title="Verified skills"
                    description="Pass quick skill checks to unlock verified levels and receive matching tasks."
                    actions={
                      <Button asChild size="sm" variant="outline" className="text-xs">
                        <Link to="/app/onboarding/skills">Browse All Skills &amp; Checks</Link>
                      </Button>
                    }
                  />
                  {verifiedSkills.length === 0 ? (
                    <p className="rounded-md border border-dashed border-[#E5E1D7] p-3 text-xs text-[#69736D]">
                      No verified skills yet. Complete a Level 1 check below to earn your first verified skill badge.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.map((skill) => (
                        <SkillLevelBadge key={skill.id} name={skill.name} level={skill.level} />
                      ))}
                    </div>
                  )}

                  {assessmentError ? <Alert tone="danger">{assessmentError}</Alert> : null}
                  {assessmentResult ? (
                    <Alert tone={assessmentResult.passed ? "success" : "warning"}>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {assessmentResult.skillName} · Level {assessmentResult.level} ({assessmentResult.levelName}) —{" "}
                          {assessmentResult.passed ? "PASSED" : "NOT PASSED"} ({assessmentResult.score}% /{" "}
                          {assessmentResult.passingScore}% required)
                        </p>
                        {assessmentResult.cooldownUntil ? (
                          <p className="text-xs">
                            You can retry after {formatDate(assessmentResult.cooldownUntil)}. Previously passed levels remain active.
                          </p>
                        ) : null}
                      </div>
                    </Alert>
                  ) : null}

                  {activeAttempt ? (
                    <div className="space-y-3 rounded-lg border border-[#365FEA]/30 bg-[#F0EEE7] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-[#202722]">
                            {activeAttempt.skillName} — Level {activeAttempt.level} ({activeAttempt.levelName})
                          </p>
                          <p className="text-[11px] text-[#69736D]">
                            Passing score: {activeAttempt.passingScore}%
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveAttempt(null)}
                        >
                          Cancel
                        </Button>
                      </div>

                      {activeAttempt.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-2 rounded-md border border-[#E5E1D7] bg-[#FFFEFA] p-3">
                          <p className="text-xs font-medium text-[#202722]">
                            {idx + 1}. {q.prompt}
                          </p>
                          {q.type === "MULTIPLE_CHOICE" && q.options ? (
                            <div className="space-y-1.5">
                              {q.options.map((opt) => (
                                <label
                                  key={opt.id}
                                  className="flex cursor-pointer items-start gap-2 rounded border border-[#E5E1D7] p-2 text-xs text-[#202722] hover:bg-[#F0EEE7]/70"
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={opt.id}
                                    checked={answers[q.id] === opt.id}
                                    onChange={() =>
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: opt.id,
                                      }))
                                    }
                                    className="mt-0.5 accent-[#365FEA]"
                                  />
                                  <span>{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <Textarea
                              rows={4}
                              className="text-xs"
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          loading={submitAssessment.isPending}
                          onClick={() => submitAssessment.mutate()}
                        >
                          Submit answers
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {skillsCatalog.data?.skills ? (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-semibold text-[#202722]">
                        Skill levels (Level 1 to Level 3)
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {skillsCatalog.data.skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex flex-col justify-between gap-2 rounded-md border border-[#E5E1D7] bg-[#FFFEFA] p-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[#202722]">{skill.name}</span>
                                {skill.verifiedLevel > 0 ? (
                                  <SkillLevelBadge level={skill.verifiedLevel} />
                                ) : (
                                  <Badge tone="neutral">Not verified</Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-[#69736D]">{skill.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {skill.stages.map((stage) => {
                                const canStart = stage.status === "AVAILABLE";
                                return (
                                  <Button
                                    key={stage.id}
                                    type="button"
                                    size="sm"
                                    variant={stage.passed ? "secondary" : canStart ? "outline" : "ghost"}
                                    disabled={!canStart || startAssessment.isPending}
                                    onClick={() =>
                                      startAssessment.mutate({ skillId: skill.slug, level: stage.level })
                                    }
                                    className="h-7 px-2 text-[11px]"
                                  >
                                    {stage.passed ? (
                                      <CheckCircle2 className="size-3 text-[#438866]" />
                                    ) : canStart ? (
                                      <Play className="size-3 text-[#365FEA]" />
                                    ) : (
                                      <Lock className="size-3 text-[#69736D]" />
                                    )}
                                    L{stage.level} {stage.levelName}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {reviewer ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-[#202722]">
                  <Wallet className="size-4 text-[#365FEA]" /> PayPal payout details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert tone="info">
                  Payments are released after submitted work passes safety and quality checks.
                </Alert>
                <Field
                  label="PayPal email"
                  htmlFor="profile-payout-email"
                  hint="Enter the PayPal email where specialist payouts should be sent."
                >
                  <Input
                    id="profile-payout-email"
                    type="email"
                    value={payoutEmail}
                    onChange={(event) => setPayoutEmail(event.target.value)}
                    placeholder="specialist@example.com"
                    maxLength={200}
                  />
                </Field>
                <label className="flex items-start gap-2.5 rounded-xl bg-[#F0EEE7] p-3.5 text-xs leading-5 text-[#202722]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 size-4 accent-[#365FEA]"
                  />
                  <span>
                    I consent to receive specialist payments at this PayPal email after submitted work passes checks.
                  </span>
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={ready ? "success" : "warning"} dot>
                    {ready ? "Payout profile ready" : "Payout profile incomplete"}
                  </Badge>
                  {stats ? (
                    <span className="text-xs text-[#69736D] tabular-nums">
                      {stats.completedPayoutCount} completed payment{stats.completedPayoutCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="max-w-md text-xs leading-5 text-[#69736D]">
              Your payout preferences are saved securely with your account.
            </p>
            <Button type="submit" loading={save.isPending}>
              <Save className="size-4" /> Save profile
            </Button>
          </div>
        </form>

        <aside className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#202722]">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DataRow label="Role">
                  <Badge tone={user.role === "REVIEWER" ? "info" : "neutral"}>
                    {user.role === "REVIEWER" ? "Specialist" : "Requester"}
                  </Badge>
                </DataRow>
                <DataRow label="Specialist status">
                  {user.role === "REVIEWER" ? (
                    <Badge tone={user.isReviewerApproved ? "success" : "warning"} dot>
                      {user.isReviewerApproved ? "Approved" : "Pending"}
                    </Badge>
                  ) : (
                    "Not applicable"
                  )}
                </DataRow>
                <DataRow label="Member since">{formatDate(user.createdAt)}</DataRow>
                <DataRow label="Payout method">{user.profile?.payoutProvider ?? "PayPal"}</DataRow>
                <DataRow label="Consent">{consent ? "Saved" : "Not set"}</DataRow>
              </dl>
            </CardContent>
          </Card>

          {reviewer ? (
            <Card className={ready ? "border-[#438866]/35" : "border-[#C97A2E]/40"}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-[#202722]">
                  {ready ? (
                    <BadgeCheck className="size-4 text-[#438866]" />
                  ) : (
                    <Mail className="size-4 text-[#C97A2E]" />
                  )}
                  Payout readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs leading-5 text-[#69736D]">
                {ready ? (
                  <p>
                    Your payout profile is ready. Completed payments appear in your payment history.
                  </p>
                ) : (
                  <p>
                    Add a PayPal email and confirm consent so completed task payments can be sent to you.
                  </p>
                )}
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/app/earnings">
                    <BriefcaseBusiness className="size-3.5" /> View payments
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="space-y-2 p-4 text-xs leading-5 text-[#69736D]">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#202722]">
                <ShieldCheck className="size-3.5 text-[#365FEA]" /> Payment protection
              </p>
              <p>
                Payout details are kept private and payments are released only after completed work passes safety and
                quality checks.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
