import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  McpSecurityError,
  writeMcpAuditLog,
  type AgentRateLimiter,
  type AuthenticatedAgentContext,
} from "../services/auth.js";
import {
  getVerifiedResultInputRawShape,
  getVerifiedResultInputSchema,
  redactSecretsInText,
} from "../services/validation.js";
import type { TrustToPayApiClient } from "../services/trusttopay-client.js";

export const GET_VERIFIED_RESULT_TOOL_NAME = "trusttopay_get_verified_result";

export const GET_VERIFIED_RESULT_TOOL_DESCRIPTION =
  "Retrieve the cryptographically verified human specialist deliverable (files, patch, SHA-256 digest, Gemini security review PASS verdict, and isolated test execution summary). Strictly blocks unverified, BLOCK, or NEEDS_HUMAN_REVIEW submissions.";

export { getVerifiedResultInputRawShape };

export async function executeGetVerifiedResultTool(
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
    const parsed = getVerifiedResultInputSchema.parse(rawArgs);
    const verified = await deps.apiClient.getVerifiedResult(deps.auth, parsed.taskId);

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: GET_VERIFIED_RESULT_TOOL_NAME,
        keyPrefix: deps.auth.keyPrefix,
        keyFingerprint: deps.auth.keyFingerprint,
        taskId: verified.taskId,
        outcome: "SUCCESS",
        durationMs: Date.now() - startedAt,
      },
      deps.auditLogger,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(verified, null, 2),
        },
      ],
      structuredContent: verified as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const code = error instanceof McpSecurityError ? error.code : "VALIDATION_ERROR";
    const message = redactSecretsInText(
      error instanceof Error ? error.message : "Failed to execute trusttopay_get_verified_result.",
    );

    writeMcpAuditLog(
      {
        timestamp: new Date().toISOString(),
        correlationId: deps.auth.correlationId,
        toolName: GET_VERIFIED_RESULT_TOOL_NAME,
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
