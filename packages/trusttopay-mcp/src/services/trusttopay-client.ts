import { McpSecurityError, type AuthenticatedAgentContext } from "./auth.js";
import { redactSecretsInText, type CreateTaskToolInput } from "./validation.js";

export type FetchLike = typeof fetch;

export interface TrustToPayClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  autoDispatchOffers?: boolean;
  fetchImpl?: FetchLike;
}

export interface CreateTaskResponseOutput {
  taskId: string;
  status: string;
  createdAt: string;
  minimumSkillLevel: number;
  requiredSkills: string[];
  rewardMinor: number;
  currency: string;
  offersDispatched: number;
  idempotentReplay: boolean;
  correlationId: string;
}

export interface GetTaskStatusResponseOutput {
  taskId: string;
  status: string;
  assigned: boolean;
  assignedSpecialist: {
    assignedAt: string | null;
    status: string;
  } | null;
  verificationStatus: string | null;
  securityVerdict: string | null;
  isReadyForHandback: boolean;
  updatedAt: string;
  correlationId: string;
}

export interface VerifiedResultOutput {
  taskId: string;
  taskStatus: string;
  verifiedAt: string;
  handoffIdempotencyKey: string;
  artifact: {
    id: string;
    version: number;
    sha256Digest: string;
    totalSizeBytes: number;
    fileCount: number;
    fileManifest: Array<{
      path: string;
      sizeBytes: number;
      sha256: string;
    }>;
    changedFiles: Array<{
      path: string;
      content: string;
    }>;
    patchText: string | null;
    archiveUrl: string | null;
  };
  verification: {
    verificationRunId: string;
    status: "PASSED";
    decisionReason: string;
    artifactVersion: number;
    artifactSha256: string;
  };
  safetyReview: {
    safetyReviewId: string;
    verdict: "PASS";
    riskLevel: string;
    engine: string;
    artifactSha256: string;
    reviewedAt: string;
  };
  testRunSummary: {
    runnerMode: string;
    runnerImageVersion: string;
    command: string;
    exitCode: number;
    passed: true;
    durationMs: number;
    stdout: string;
    artifactSha256: string;
  };
  signature: {
    header: string;
    timestamp: string;
    algorithm: string;
  } | null;
  idempotentReplay: boolean;
  correlationId: string;
}

export interface CancelTaskResponseOutput {
  taskId: string;
  status: string;
  cancelledAt: string;
  reason: string;
  correlationId: string;
}

function mapUrgencyToRiskLevel(urgency: CreateTaskToolInput["urgency"]): "STANDARD" | "HIGH" {
  switch (urgency) {
    case "high":
    case "critical":
      return "HIGH";
    case "low":
    case "normal":
    default:
      return "STANDARD";
  }
}

function buildStructuredTaskQuestion(
  input: CreateTaskToolInput & { formattedAcceptanceCriteria: string },
): string {
  const parts: string[] = [
    input.description.trim(),
    "",
    `Expected Deliverable Type: ${input.expectedOutputType}`,
    `Urgency: ${input.urgency.toUpperCase()} (Target SLA: ${input.deadlineMinutes} minutes)`,
  ];

  if (input.contextFiles && input.contextFiles.length > 0) {
    parts.push("", "### Attached Context Files");
    for (const file of input.contextFiles) {
      const shaLabel = file.sha256 ? ` (sha256: ${file.sha256})` : "";
      parts.push(`- \`${file.path}\`${shaLabel}`);
      if (file.content) {
        parts.push("```", file.content.trim(), "```");
      }
    }
  }

  return parts.join("\n").slice(0, 4000);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TrustToPayApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly autoDispatchOffers: boolean;
  private readonly fetchImpl: FetchLike;

  constructor(options: TrustToPayClientOptions = {}) {
    const rawBase =
      options.baseUrl ??
      process.env.TRUSTTOPAY_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "http://127.0.0.1:3000";
    this.baseUrl = rawBase.replace(/\/+$/, "");
    this.timeoutMs =
      options.timeoutMs ??
      Math.max(1000, Number.parseInt(process.env.TRUSTTOPAY_MCP_TIMEOUT_MS ?? "15000", 10) || 15000);
    this.autoDispatchOffers =
      options.autoDispatchOffers ??
      (process.env.TRUSTTOPAY_MCP_AUTO_DISPATCH ?? "true").toLowerCase() !== "false";
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  private async requestJson<T>(
    auth: AuthenticatedAgentContext,
    path: string,
    init: {
      method: "GET" | "POST" | "PATCH" | "DELETE";
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<{ status: number; data: T }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${auth.agentApiKey}`,
      "X-Correlation-Id": auth.correlationId,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    };

    try {
      const response = await this.fetchImpl(url, {
        method: init.method,
        headers,
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        signal: controller.signal,
      });

      const rawText = await response.text();
      let parsed: any = null;
      if (rawText) {
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = { message: rawText };
        }
      }

      if (!response.ok) {
        const code =
          parsed?.error?.code ??
          parsed?.code ??
          (response.status === 401
            ? "UNAUTHORIZED"
            : response.status === 403
              ? "FORBIDDEN"
              : response.status === 404
                ? "NOT_FOUND"
                : "API_REQUEST_FAILED");
        const message = redactSecretsInText(
          parsed?.error?.message ??
            parsed?.message ??
            `TrustToPay API returned HTTP ${response.status}`,
        );
        throw new McpSecurityError(code, message, response.status);
      }

      return { status: response.status, data: parsed as T };
    } catch (error) {
      if (error instanceof McpSecurityError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new McpSecurityError(
          "UPSTREAM_TIMEOUT",
          `TrustToPay API request timed out after ${this.timeoutMs}ms.`,
          504,
        );
      }
      throw new McpSecurityError(
        "UPSTREAM_UNAVAILABLE",
        redactSecretsInText(error instanceof Error ? error.message : "Failed to reach TrustToPay API."),
        502,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  public async createTask(
    auth: AuthenticatedAgentContext,
    input: CreateTaskToolInput & {
      normalizedSkillLevel: 1 | 2 | 3;
      formattedAcceptanceCriteria: string;
    },
  ): Promise<CreateTaskResponseOutput> {
    const question = buildStructuredTaskQuestion(input);
    const riskLevel = mapUrgencyToRiskLevel(input.urgency);

    const createRes = await this.requestJson<{
      task: Record<string, any>;
      idempotentReplay?: boolean;
    }>(auth, "/api/v1/tasks", {
      method: "POST",
      headers: {
        "Idempotency-Key": input.idempotencyKey,
      },
      body: {
        title: input.title,
        question,
        acceptanceCriteria: input.formattedAcceptanceCriteria,
        category: input.category,
        requiredSkills: input.requiredSkills,
        minimumSkillLevel: input.normalizedSkillLevel,
        rewardMinor: input.budgetMax,
        rewardApproved: true,
        riskLevel,
        idempotencyKey: input.idempotencyKey,
      },
    });

    let task = createRes.data.task;
    const idempotentReplay = Boolean(createRes.data.idempotentReplay);
    let offersDispatched = Array.isArray(task.offers) ? task.offers.length : 0;

    // If newly created (not an already-progressed replay) and autoDispatchOffers is enabled,
    // fund in simulated mode (when applicable) and dispatch offers to top 5 ranked specialists.
    if (this.autoDispatchOffers && !idempotentReplay && task.status === "AWAITING_FUNDING") {
      try {
        const orderRes = await this.requestJson<{
          transaction: Record<string, any>;
          paypal?: { mode?: string; orderId?: string };
        }>(auth, "/api/v1/payments/paypal/orders", {
          method: "POST",
          body: { taskId: task.id },
        });

        const orderId = orderRes.data.paypal?.orderId ?? orderRes.data.transaction?.orderId;
        const mode = orderRes.data.paypal?.mode ?? orderRes.data.transaction?.mode;

        if (orderId && mode === "SIMULATED") {
          await this.requestJson(
            auth,
            `/api/v1/payments/paypal/orders/${encodeURIComponent(orderId)}/capture`,
            {
              method: "POST",
              body: {},
            },
          );
        }
      } catch {
        // Non-fatal: in live Sandbox mode where interactive approval is required, task remains AWAITING_FUNDING
      }

      try {
        const dispatchRes = await this.requestJson<{
          dispatchedCount?: number;
          offers?: unknown[];
          task?: Record<string, any>;
        }>(auth, `/api/v1/tasks/${encodeURIComponent(task.id)}/offers/dispatch`, {
          method: "POST",
          body: {},
        });
        if (dispatchRes.data.task) {
          task = dispatchRes.data.task;
        }
        offersDispatched =
          typeof dispatchRes.data.dispatchedCount === "number"
            ? dispatchRes.data.dispatchedCount
            : Array.isArray(dispatchRes.data.offers)
              ? dispatchRes.data.offers.length
              : offersDispatched;
      } catch {
        // If no specialists match yet or dispatch is deferred, retain current task state
      }
    }

    return {
      taskId: String(task.id),
      status: String(task.status),
      createdAt: String(task.createdAt ?? new Date().toISOString()),
      minimumSkillLevel: Number(task.minimumSkillLevel ?? input.normalizedSkillLevel),
      requiredSkills: Array.isArray(task.requiredSkills) ? task.requiredSkills : input.requiredSkills,
      rewardMinor: Number(task.rewardMinor ?? input.budgetMax),
      currency: String(task.currency ?? "USD"),
      offersDispatched,
      idempotentReplay,
      correlationId: auth.correlationId,
    };
  }

  public async getTaskStatus(
    auth: AuthenticatedAgentContext,
    taskId: string,
  ): Promise<GetTaskStatusResponseOutput> {
    const res = await this.requestJson<{ task: Record<string, any> }>(
      auth,
      `/api/v1/tasks/${encodeURIComponent(taskId)}`,
      { method: "GET" },
    );

    const task = res.data.task;
    if (!task || !task.id) {
      throw new McpSecurityError("TASK_NOT_FOUND", `Task '${taskId}' was not found.`, 404);
    }

    // Never expose specialist email or internal reviewer notes
    const assignment = task.assignment ?? null;
    const latestVerification =
      Array.isArray(task.verificationRuns) && task.verificationRuns.length > 0
        ? task.verificationRuns[0]
        : task.latestVerification ?? null;

    const verificationStatus: string | null = latestVerification?.status ?? null;
    const securityVerdict: string | null =
      latestVerification?.securityVerdict ??
      latestVerification?.securityReview?.verdict ??
      null;
    const executionPassed: boolean =
      Boolean(latestVerification?.executionSummary?.passed) &&
      latestVerification?.executionSummary?.exitCode === 0;

    const isReadyForHandback =
      ["VERIFIED", "PAYMENT_READY", "HANDED_OFF", "PAYMENT_PAID", "COMPLETED"].includes(String(task.status)) &&
      verificationStatus === "PASSED" &&
      securityVerdict === "PASS" &&
      executionPassed;

    return {
      taskId: String(task.id),
      status: String(task.status),
      assigned: Boolean(assignment),
      assignedSpecialist: assignment
        ? {
            assignedAt: assignment.acceptedAt ? String(assignment.acceptedAt) : null,
            status: String(assignment.status ?? "ACTIVE"),
          }
        : null,
      verificationStatus,
      securityVerdict,
      isReadyForHandback,
      updatedAt: String(task.updatedAt ?? task.createdAt ?? new Date().toISOString()),
      correlationId: auth.correlationId,
    };
  }

  public async getVerifiedResult(
    auth: AuthenticatedAgentContext,
    taskId: string,
  ): Promise<VerifiedResultOutput> {
    const res = await this.requestJson<{
      handback: Record<string, any>;
      signature?: {
        header: string;
        timestamp: string;
        algorithm: string;
      };
      idempotentReplay?: boolean;
    }>(auth, `/api/v1/tasks/${encodeURIComponent(taskId)}/handback`, {
      method: "GET",
    });

    const handback = res.data.handback;
    if (!handback || !handback.artifact) {
      throw new McpSecurityError(
        "HANDBACK_NOT_READY",
        "No verified artifact is available for handoff on this task.",
        409,
      );
    }

    // Enforce client-side defense-in-depth verification of all 3 gates + SHA-256 binding
    const artifactSha = String(handback.artifact.sha256Digest ?? "");
    const verificationStatus = String(handback.verification?.status ?? "");
    const verificationSha = String(handback.verification?.artifactSha256 ?? "");
    const safetyVerdict = String(handback.safetyReview?.verdict ?? "");
    const safetySha = String(handback.safetyReview?.artifactSha256 ?? "");
    const testPassed = Boolean(handback.testRunSummary?.passed);
    const testExitCode = Number(handback.testRunSummary?.exitCode ?? -1);
    const testSha = String(handback.testRunSummary?.artifactSha256 ?? "");

    if (verificationStatus !== "PASSED") {
      throw new McpSecurityError(
        "VERIFICATION_GATE_BLOCKED",
        `Artifact handback rejected: verification status is '${verificationStatus}' (must be 'PASSED').`,
        409,
      );
    }

    if (safetyVerdict !== "PASS") {
      throw new McpSecurityError(
        "SECURITY_GATE_BLOCKED",
        `Artifact handback rejected: Gemini security gate verdict is '${safetyVerdict}' (must be 'PASS'). Submissions marked BLOCK or NEEDS_HUMAN_REVIEW are never returned to agents.`,
        409,
      );
    }

    if (!testPassed || testExitCode !== 0) {
      throw new McpSecurityError(
        "EXECUTION_GATE_BLOCKED",
        `Artifact handback rejected: isolated test execution did not pass (passed=${String(testPassed)}, exitCode=${testExitCode}).`,
        409,
      );
    }

    if (
      !artifactSha ||
      !/^[a-fA-F0-9]{64}$/.test(artifactSha) ||
      artifactSha !== verificationSha ||
      artifactSha !== safetySha ||
      artifactSha !== testSha
    ) {
      throw new McpSecurityError(
        "ARTIFACT_DIGEST_MISMATCH",
        "Cryptographic SHA-256 digest mismatch detected across artifact, verification run, security review, or test execution summary.",
        409,
      );
    }

    // Sanitize changedFiles to ensure no accidental secret exposure
    const changedFiles = Array.isArray(handback.artifact.changedFiles)
      ? handback.artifact.changedFiles.map((f: Record<string, any>) => ({
          path: String(f.path),
          content: redactSecretsInText(String(f.content ?? "")),
        }))
      : [];

    const fileManifest = Array.isArray(handback.artifact.fileManifest)
      ? handback.artifact.fileManifest.map((m: Record<string, any>) => ({
          path: String(m.path),
          sizeBytes: Number(m.sizeBytes ?? 0),
          sha256: String(m.sha256 ?? ""),
        }))
      : [];

    return {
      taskId: String(handback.taskId),
      taskStatus: String(handback.taskStatus),
      verifiedAt: String(handback.verifiedAt),
      handoffIdempotencyKey: String(handback.handoffIdempotencyKey),
      artifact: {
        id: String(handback.artifact.id),
        version: Number(handback.artifact.version),
        sha256Digest: artifactSha,
        totalSizeBytes: Number(handback.artifact.totalSizeBytes ?? 0),
        fileCount: Number(handback.artifact.fileCount ?? changedFiles.length),
        fileManifest,
        changedFiles,
        patchText: handback.artifact.patchText ? redactSecretsInText(String(handback.artifact.patchText)) : null,
        archiveUrl: handback.artifact.archiveUrl ? String(handback.artifact.archiveUrl) : null,
      },
      verification: {
        verificationRunId: String(handback.verification.verificationRunId),
        status: "PASSED",
        decisionReason: redactSecretsInText(String(handback.verification.decisionReason ?? "")),
        artifactVersion: Number(handback.verification.artifactVersion),
        artifactSha256: verificationSha,
      },
      safetyReview: {
        safetyReviewId: String(handback.safetyReview.safetyReviewId),
        verdict: "PASS",
        riskLevel: String(handback.safetyReview.riskLevel),
        engine: String(handback.safetyReview.engine),
        artifactSha256: safetySha,
        reviewedAt: String(handback.safetyReview.reviewedAt),
      },
      testRunSummary: {
        runnerMode: String(handback.testRunSummary.runnerMode),
        runnerImageVersion: String(handback.testRunSummary.runnerImageVersion),
        command: String(handback.testRunSummary.command),
        exitCode: testExitCode,
        passed: true,
        durationMs: Number(handback.testRunSummary.durationMs ?? 0),
        stdout: redactSecretsInText(String(handback.testRunSummary.stdout ?? "")),
        artifactSha256: testSha,
      },
      signature: res.data.signature ?? null,
      idempotentReplay: Boolean(res.data.idempotentReplay),
      correlationId: auth.correlationId,
    };
  }

  public async cancelTask(
    auth: AuthenticatedAgentContext,
    taskId: string,
    reason: string,
  ): Promise<CancelTaskResponseOutput> {
    const res = await this.requestJson<{ task: Record<string, any> }>(
      auth,
      `/api/v1/tasks/${encodeURIComponent(taskId)}/cancel`,
      {
        method: "POST",
        body: { reason: redactSecretsInText(reason.trim()) },
      },
    );

    const task = res.data.task;
    return {
      taskId: String(task.id),
      status: String(task.status ?? "CANCELLED"),
      cancelledAt: new Date().toISOString(),
      reason: redactSecretsInText(reason.trim()),
      correlationId: auth.correlationId,
    };
  }
}
