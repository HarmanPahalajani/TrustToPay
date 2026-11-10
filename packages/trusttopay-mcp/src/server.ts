import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  AgentRateLimiter,
  generateCorrelationId,
  loadMcpAuthConfig,
  McpSecurityError,
  resolveAgentContext,
  type AuthenticatedAgentContext,
  type McpAuthConfig,
} from "./services/auth.js";
import {
  TrustToPayApiClient,
  type TrustToPayClientOptions,
} from "./services/trusttopay-client.js";
import {
  CREATE_TASK_TOOL_DESCRIPTION,
  CREATE_TASK_TOOL_NAME,
  createTaskInputRawShape,
  executeCreateTaskTool,
} from "./tools/create-task.js";
import {
  GET_TASK_STATUS_TOOL_DESCRIPTION,
  GET_TASK_STATUS_TOOL_NAME,
  executeGetTaskStatusTool,
  getTaskStatusInputRawShape,
} from "./tools/get-task-status.js";
import {
  GET_VERIFIED_RESULT_TOOL_DESCRIPTION,
  GET_VERIFIED_RESULT_TOOL_NAME,
  executeGetVerifiedResultTool,
  getVerifiedResultInputRawShape,
} from "./tools/get-verified-result.js";
import {
  CANCEL_TASK_TOOL_DESCRIPTION,
  CANCEL_TASK_TOOL_NAME,
  cancelTaskInputRawShape,
  executeCancelTaskTool,
} from "./tools/cancel-task.js";

export const OFFICIAL_TRUSTTOPAY_MCP_TOOLS = [
  CREATE_TASK_TOOL_NAME,
  GET_TASK_STATUS_TOOL_NAME,
  GET_VERIFIED_RESULT_TOOL_NAME,
  CANCEL_TASK_TOOL_NAME,
] as const;

export interface CreateTrustToPayMcpServerOptions {
  authConfig?: Partial<McpAuthConfig>;
  clientOptions?: TrustToPayClientOptions;
  apiClient?: TrustToPayApiClient;
  rateLimiter?: AgentRateLimiter;
  auditLogger?: (line: string) => void;
  /** Optional dynamic resolver for per-request API keys in HTTP transport */
  resolveRequestApiKey?: () => string | undefined;
}

export interface TrustToPayMcpServerInstance {
  mcpServer: McpServer;
  authConfig: McpAuthConfig;
  apiClient: TrustToPayApiClient;
  rateLimiter: AgentRateLimiter;
}

export function createTrustToPayMcpServer(
  options: CreateTrustToPayMcpServerOptions = {},
): TrustToPayMcpServerInstance {
  const baseAuthConfig = loadMcpAuthConfig();
  const authConfig: McpAuthConfig = {
    ...baseAuthConfig,
    ...(options.authConfig ?? {}),
  };

  const apiClient = options.apiClient ?? new TrustToPayApiClient(options.clientOptions);
  const rateLimiter =
    options.rateLimiter ?? new AgentRateLimiter(authConfig.rateLimitPerMinute, 60_000);

  const mcpServer = new McpServer(
    {
      name: "@trusttopay/mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
      instructions:
        "Official TrustToPay MCP Server. Exposes strictly four tools for autonomous AI agents: trusttopay_create_task, trusttopay_get_task_status, trusttopay_get_verified_result, and trusttopay_cancel_task.",
    },
  );

  const resolveAuth = (extra?: { authInfo?: { token?: string } }): AuthenticatedAgentContext => {
    const tokenFromExtra = extra?.authInfo?.token;
    const tokenFromHook = options.resolveRequestApiKey?.();
    return resolveAgentContext(
      authConfig,
      tokenFromExtra ?? tokenFromHook ?? authConfig.defaultAgentApiKey,
      generateCorrelationId(),
    );
  };

  const authErrorResult = (error: unknown) => {
    const code = error instanceof McpSecurityError ? error.code : "AGENT_AUTH_REQUIRED";
    const message =
      error instanceof Error ? error.message : "Authentication required to invoke TrustToPay MCP tool.";
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: {
                code,
                message,
              },
            },
            null,
            2,
          ),
        },
      ],
    };
  };

  mcpServer.registerTool(
    CREATE_TASK_TOOL_NAME,
    {
      title: "Create TrustToPay Specialist Task",
      description: CREATE_TASK_TOOL_DESCRIPTION,
      inputSchema: createTaskInputRawShape,
      annotations: {
        title: "Create TrustToPay Specialist Task",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      let auth: AuthenticatedAgentContext;
      try {
        auth = resolveAuth(extra);
      } catch (err) {
        return authErrorResult(err);
      }
      return executeCreateTaskTool(args, {
        auth,
        authConfig,
        rateLimiter,
        apiClient,
        auditLogger: options.auditLogger,
      });
    },
  );

  mcpServer.registerTool(
    GET_TASK_STATUS_TOOL_NAME,
    {
      title: "Get TrustToPay Task Status",
      description: GET_TASK_STATUS_TOOL_DESCRIPTION,
      inputSchema: getTaskStatusInputRawShape,
      annotations: {
        title: "Get TrustToPay Task Status",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      let auth: AuthenticatedAgentContext;
      try {
        auth = resolveAuth(extra);
      } catch (err) {
        return authErrorResult(err);
      }
      return executeGetTaskStatusTool(args, {
        auth,
        rateLimiter,
        apiClient,
        auditLogger: options.auditLogger,
      });
    },
  );

  mcpServer.registerTool(
    GET_VERIFIED_RESULT_TOOL_NAME,
    {
      title: "Get Verified TrustToPay Deliverable",
      description: GET_VERIFIED_RESULT_TOOL_DESCRIPTION,
      inputSchema: getVerifiedResultInputRawShape,
      annotations: {
        title: "Get Verified TrustToPay Deliverable",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      let auth: AuthenticatedAgentContext;
      try {
        auth = resolveAuth(extra);
      } catch (err) {
        return authErrorResult(err);
      }
      return executeGetVerifiedResultTool(args, {
        auth,
        rateLimiter,
        apiClient,
        auditLogger: options.auditLogger,
      });
    },
  );

  mcpServer.registerTool(
    CANCEL_TASK_TOOL_NAME,
    {
      title: "Cancel TrustToPay Task",
      description: CANCEL_TASK_TOOL_DESCRIPTION,
      inputSchema: cancelTaskInputRawShape,
      annotations: {
        title: "Cancel TrustToPay Task",
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args, extra) => {
      let auth: AuthenticatedAgentContext;
      try {
        auth = resolveAuth(extra);
      } catch (err) {
        return authErrorResult(err);
      }
      return executeCancelTaskTool(args, {
        auth,
        rateLimiter,
        apiClient,
        auditLogger: options.auditLogger,
      });
    },
  );

  return {
    mcpServer,
    authConfig,
    apiClient,
    rateLimiter,
  };
}
