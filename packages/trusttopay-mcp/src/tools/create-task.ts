import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  enforceServerBudgetPolicy,
  McpSecurityError,
  writeMcpAuditLog,
  type AgentRateLimiter,
  type AuthenticatedAgentContext,
  type McpAuthConfig,
} from "../services/auth.js";
import {
  createTaskInputRawShape,
  redactSecretsInText,
  validateAndSanitizeCreateTaskInput,
} from "../services/validation.js";
import type { TrustToPayApiClient } from "../services/trusttopay-client.js";

export const CREATE_TASK_TOOL_NAME = "trusttopay_create_task";

export const CREATE_TASK_TOOL_DESCRIPTION =
  "Create an idempotent TrustToPay human specialist verification or coding task when an AI agent encounters low confidence, repeated test failures, security-critical logic, or domain ambiguity. Enforces secret redaction, server-side budget policy, and dispatches offers to ranked L1-L3 specialists.";

export { createTaskInputRawShape };

export async function executeCreateTaskTool(
  rawArgs: unknown,
  deps: {
    auth: AuthenticatedAgentContext;
    authConfig: McpAuthConfig;
    rateLimiter: AgentRateLimiter;
    apiClient: TrustToPayApiClient;
    auditLogger?: (line: string) => void;
  },
): Promise<CallToolResult> {
  const startedAt = Date.now();
  try {
    deps.rateLimiter.checkAndRecord(deps.auth.keyFingerprint);
    const validated = validateAndSanitizeCreateTaskInput(rawArgs);
    enforceServerBudgetPolicy(validated.budgetMax, deps.authConfig);

    const created = await deps.apiClient.createTask(deps.auth, validated);

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: CREATE_TASK_TOOL_NAME,
        keyPrefix: deps.auth.keyPrefix,
        keyFingerprint: deps.auth.keyFingerprint,
        taskId: created.taskId,
        outcome: "SUCCESS",
        durationMs: Date.now() - startedAt,
      },
      deps.auditLogger,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(created, null, 2),
        },
      ],
      structuredContent: created as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const code = error instanceof McpSecurityError ? error.code : "VALIDATION_ERROR";
    const message = redactSecretsInText(
      error instanceof Error ? error.message : "Failed to execute trusttopay_create_task.",
    );

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: CREATE_TASK_TOOL_NAME,
        keyPrefix: deps.auth.keyPrefix,
        keyFingerprint: deps.auth.keyFingerprint,
        outcome: "ERROR",
        errorCode: code,
        durationMs: Date.now() - startedAt,
      },
      deps.auditLogger,
    );

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: {
                code,
                message,
                correlationId: deps.auth.correlationId,
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
