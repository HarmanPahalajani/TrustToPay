import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  McpSecurityError,
  writeMcpAuditLog,
  type AgentRateLimiter,
  type AuthenticatedAgentContext,
} from "../services/auth.js";
import {
  cancelTaskInputRawShape,
  cancelTaskInputSchema,
  redactSecretsInText,
} from "../services/validation.js";
import type { TrustToPayApiClient } from "../services/trusttopay-client.js";

export const CANCEL_TASK_TOOL_NAME = "trusttopay_cancel_task";

export const CANCEL_TASK_TOOL_DESCRIPTION =
  "Cancel an active TrustToPay task owned by the authenticated agent when it is in a cancellable pre-settlement state, recording the cancellation reason in the audit trail.";

export { cancelTaskInputRawShape };

export async function executeCancelTaskTool(
  rawArgs: unknown,
  deps: {
    auth: AuthenticatedAgentContext;
    rateLimiter: AgentRateLimiter;
    apiClient: TrustToPayApiClient;
    auditLogger?: (line: string) => void;
  },
): Promise<CallToolResult> {
  const startedAt = Date.now();
  try {
    deps.rateLimiter.checkAndRecord(deps.auth.keyFingerprint);
    const parsed = cancelTaskInputSchema.parse(rawArgs);
    const cancelled = await deps.apiClient.cancelTask(deps.auth, parsed.taskId, parsed.reason);

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: CANCEL_TASK_TOOL_NAME,
        keyPrefix: deps.auth.keyPrefix,
        keyFingerprint: deps.auth.keyFingerprint,
        taskId: cancelled.taskId,
        outcome: "SUCCESS",
        durationMs: Date.now() - startedAt,
      },
      deps.auditLogger,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(cancelled, null, 2),
        },
      ],
      structuredContent: cancelled as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const code = error instanceof McpSecurityError ? error.code : "VALIDATION_ERROR";
    const message = redactSecretsInText(
      error instanceof Error ? error.message : "Failed to execute trusttopay_cancel_task.",
    );

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: CANCEL_TASK_TOOL_NAME,
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
