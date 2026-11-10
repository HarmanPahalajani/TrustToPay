#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import {
  createTrustToPayMcpServer,
  OFFICIAL_TRUSTTOPAY_MCP_TOOLS,
  type CreateTrustToPayMcpServerOptions,
  type TrustToPayMcpServerInstance,
} from "./server.js";
import { startStdioMcpServer, type StartStdioTransportOptions } from "./transports/stdio.js";
import {
  startHttpMcpServer,
  type RunningHttpMcpServer,
  type StartHttpMcpServerOptions,
} from "./transports/http.js";
import {
  AgentRateLimiter,
  AGENT_KEY_PATTERN,
  enforceServerBudgetPolicy,
  extractBearerToken,
  generateCorrelationId,
  loadMcpAuthConfig,
  McpSecurityError,
  resolveAgentContext,
  validateAgentApiKeyFormat,
  validateHttpOrigin,
  writeMcpAuditLog,
  type AuthenticatedAgentContext,
  type McpAuditEntry,
  type McpAuthConfig,
} from "./services/auth.js";
import {
  cancelTaskInputSchema,
  createTaskInputSchema,
  getTaskStatusInputSchema,
  getVerifiedResultInputSchema,
  normalizeSkillLevel,
  redactSecretsInText,
  scanTextForSecrets,
  validateAndSanitizeCreateTaskInput,
  validateSafeRelativeFilePath,
  type CancelTaskToolInput,
  type CreateTaskToolInput,
  type GetTaskStatusToolInput,
  type GetVerifiedResultToolInput,
  type SecretScanFinding,
} from "./services/validation.js";
import {
  TrustToPayApiClient,
  type CancelTaskResponseOutput,
  type CreateTaskResponseOutput,
  type GetTaskStatusResponseOutput,
  type TrustToPayClientOptions,
  type VerifiedResultOutput,
} from "./services/trusttopay-client.js";

export {
  createTrustToPayMcpServer,
  OFFICIAL_TRUSTTOPAY_MCP_TOOLS,
  startStdioMcpServer,
  startHttpMcpServer,
  TrustToPayApiClient,
  AgentRateLimiter,
  AGENT_KEY_PATTERN,
  McpSecurityError,
  loadMcpAuthConfig,
  resolveAgentContext,
  validateAgentApiKeyFormat,
  extractBearerToken,
  enforceServerBudgetPolicy,
  validateHttpOrigin,
  generateCorrelationId,
  writeMcpAuditLog,
  scanTextForSecrets,
  redactSecretsInText,
  validateSafeRelativeFilePath,
  validateAndSanitizeCreateTaskInput,
  normalizeSkillLevel,
  createTaskInputSchema,
  getTaskStatusInputSchema,
  getVerifiedResultInputSchema,
  cancelTaskInputSchema,
  type CreateTrustToPayMcpServerOptions,
  type TrustToPayMcpServerInstance,
  type StartStdioTransportOptions,
  type StartHttpMcpServerOptions,
  type RunningHttpMcpServer,
  type AuthenticatedAgentContext,
  type McpAuthConfig,
  type McpAuditEntry,
  type SecretScanFinding,
  type CreateTaskToolInput,
  type GetTaskStatusToolInput,
  type GetVerifiedResultToolInput,
  type CancelTaskToolInput,
  type TrustToPayClientOptions,
  type CreateTaskResponseOutput,
  type GetTaskStatusResponseOutput,
  type VerifiedResultOutput,
  type CancelTaskResponseOutput,
};

function parseCliArgs(argv: string[]): {
  transport: "stdio" | "http";
  host?: string;
  port?: number;
} {
  let transport: "stdio" | "http" =
    (process.env.TRUSTTOPAY_MCP_TRANSPORT ?? "stdio").toLowerCase() === "http" ? "http" : "stdio";
  let host: string | undefined;
  let port: number | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if ((arg === "--transport" || arg === "-t") && argv[i + 1]) {
      const val = argv[++i].toLowerCase();
      if (val === "http" || val === "streamable-http") {
        transport = "http";
      } else {
        transport = "stdio";
      }
    } else if (arg === "--http") {
      transport = "http";
    } else if (arg === "--stdio") {
      transport = "stdio";
    } else if (arg === "--host" && argv[i + 1]) {
      host = argv[++i];
    } else if (arg === "--port" && argv[i + 1]) {
      port = Number.parseInt(argv[++i], 10);
    }
  }

  return { transport, host, port };
}

async function runCli(): Promise<void> {
  const { transport, host, port } = parseCliArgs(process.argv.slice(2));

  if (transport === "http") {
    const running = await startHttpMcpServer({ host, port });
    process.stderr.write(
      `${JSON.stringify({
        service: "trusttopay-mcp",
        transport: "streamable-http",
        event: "listening",
        url: running.url,
      })}\n`,
    );
    return;
  }

  await startStdioMcpServer({ requireApiKeyAtStartup: false });
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  runCli().catch((error) => {
    process.stderr.write(
      `${JSON.stringify({
        service: "trusttopay-mcp",
        event: "fatal_startup_error",
        message: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
    process.exit(1);
  });
}
