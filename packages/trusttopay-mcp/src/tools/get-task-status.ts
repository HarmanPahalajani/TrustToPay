import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  McpSecurityError,
  writeMcpAuditLog,
  type AgentRateLimiter,
  type AuthenticatedAgentContext,
} from "../services/auth.js";
import {
  getTaskStatusInputRawShape,
  getTaskStatusInputSchema,
  redactSecretsInText,
} from "../services/validation.js";
import type { TrustToPayApiClient } from "../services/trusttopay-client.js";

export const GET_TASK_STATUS_TOOL_NAME = "trusttopay_get_task_status";

export const GET_TASK_STATUS_TOOL_DESCRIPTION =
  "Poll the current lifecycle status, specialist assignment state, verification status, security gate verdict, and handback readiness of a TrustToPay task owned by the authenticated agent.";

export { getTaskStatusInputRawShape };

export async function executeGetTaskStatusTool(
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
    const parsed = getTaskStatusInputSchema.parse(rawArgs);
    const statusResult = await deps.apiClient.getTaskStatus(deps.auth, parsed.taskId);

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: GET_TASK_STATUS_TOOL_NAME,
        keyPrefix: deps.auth.keyPrefix,
        keyFingerprint: deps.auth.keyFingerprint,
        taskId: statusResult.taskId,
        outcome: "SUCCESS",
        durationMs: Date.now() - startedAt,
      },
      deps.auditLogger,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(statusResult, null, 2),
        },
      ],
      structuredContent: statusResult as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const code = error instanceof McpSecurityError ? error.code : "VALIDATION_ERROR";
    const message = redactSecretsInText(
      error instanceof Error ? error.message : "Failed to execute trusttopay_get_task_status.",
    );

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: GET_TASK_STATUS_TOOL_NAME,
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
