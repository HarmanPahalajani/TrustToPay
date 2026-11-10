import http, { type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  createTrustToPayMcpServer,
  OFFICIAL_TRUSTTOPAY_MCP_TOOLS,
  type CreateTrustToPayMcpServerOptions,
} from "../server.js";
import {
  AgentRateLimiter,
  extractBearerToken,
  loadMcpAuthConfig,
  McpSecurityError,
  validateAgentApiKeyFormat,
  validateHttpOrigin,
  type McpAuthConfig,
} from "../services/auth.js";
import { TrustToPayApiClient } from "../services/trusttopay-client.js";

export interface StartHttpMcpServerOptions extends CreateTrustToPayMcpServerOptions {
  host?: string;
  port?: number;
}

export interface RunningHttpMcpServer {
  httpServer: http.Server;
  host: string;
  port: number;
  url: string;
  close: () => Promise<void>;
}

const MAX_HTTP_BODY_BYTES = 1_048_576; // 1 MB

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_HTTP_BODY_BYTES) {
        reject(new McpSecurityError("PAYLOAD_TOO_LARGE", "HTTP request body exceeds 1 MB limit.", 413));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new McpSecurityError("INVALID_JSON", "Malformed JSON request body.", 400));
      }
    });

    req.on("error", (err) => reject(err));
  });
}

function sendJsonError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
): void {
  if (res.headersSent) return;
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: statusCode === 401 ? -32001 : statusCode === 403 ? -32003 : -32000,
        message: `${code}: ${message}`,
        data: { code, statusCode },
      },
      id: null,
    }),
  );
}

/**
 * Starts the TrustToPay MCP Server over Streamable HTTP transport (`POST /mcp`, `GET /mcp`, `DELETE /mcp`)
 * plus a read-only `/health` status endpoint.
 *
 * Security invariants:
 * - Binds to `127.0.0.1` by default unless `TRUSTTOPAY_MCP_HOST` is explicitly configured.
 * - Validates `Origin` header against localhost or `TRUSTTOPAY_MCP_ALLOWED_ORIGINS`.
 * - Requires a valid TrustToPay Agent API key (`Authorization: Bearer ttp_...` or `X-TrustToPay-Agent-Key`)
 *   on every `/mcp` request.
 */
export async function startHttpMcpServer(
  options: StartHttpMcpServerOptions = {},
): Promise<RunningHttpMcpServer> {
  const baseAuthConfig = loadMcpAuthConfig();
  const authConfig: McpAuthConfig = {
    ...baseAuthConfig,
    ...(options.authConfig ?? {}),
  };

  const sharedApiClient = options.apiClient ?? new TrustToPayApiClient(options.clientOptions);
  const sharedRateLimiter =
    options.rateLimiter ?? new AgentRateLimiter(authConfig.rateLimitPerMinute, 60_000);

  const host = options.host ?? process.env.TRUSTTOPAY_MCP_HOST ?? "127.0.0.1";
  const requestedPort =
    options.port ??
    (process.env.TRUSTTOPAY_MCP_PORT ? Number.parseInt(process.env.TRUSTTOPAY_MCP_PORT, 10) : 3100);

  const httpServer = http.createServer(async (req, res) => {
    try {
      const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
      validateHttpOrigin(origin, authConfig);

      const urlObj = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${requestedPort}`}`);

      if (req.method === "GET" && urlObj.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            service: "@trusttopay/mcp-server",
            version: "1.0.0",
            transport: "streamable-http",
            tools: OFFICIAL_TRUSTTOPAY_MCP_TOOLS,
          }),
        );
        return;
      }

      if (urlObj.pathname !== "/mcp") {
        sendJsonError(res, 404, "NOT_FOUND", `Route '${urlObj.pathname}' not found. Use '/mcp' or '/health'.`);
        return;
      }

      const headerAgentKey =
        extractBearerToken(req.headers.authorization) ??
        (typeof req.headers["x-trusttopay-agent-key"] === "string"
          ? req.headers["x-trusttopay-agent-key"]
          : undefined) ??
        authConfig.defaultAgentApiKey;

      const validatedKey = validateAgentApiKeyFormat(headerAgentKey);

      const authInfo: AuthInfo = {
        token: validatedKey,
        clientId: validatedKey.slice(0, 14),
        scopes: ["mcp:tools"],
      };

      const parsedBody = req.method === "POST" ? await readJsonBody(req) : undefined;

      // Stateless per-request Streamable HTTP transport ensures isolated request context and zero cross-agent session leakage
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      const serverInstance = createTrustToPayMcpServer({
        ...options,
        authConfig,
        apiClient: sharedApiClient,
        rateLimiter: sharedRateLimiter,
        resolveRequestApiKey: () => validatedKey,
      });

      res.on("close", () => {
        void transport.close();
        void serverInstance.mcpServer.close();
      });

      await serverInstance.mcpServer.connect(transport);
      const authedReq = Object.assign(req, { auth: authInfo });
      await transport.handleRequest(authedReq, res, parsedBody);
    } catch (error) {
      if (error instanceof McpSecurityError) {
        sendJsonError(res, error.statusCode, error.code, error.message);
        return;
      }
      sendJsonError(
        res,
        500,
        "INTERNAL_MCP_ERROR",
        error instanceof Error ? error.message : "Unexpected MCP HTTP server error.",
      );
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(requestedPort, host, () => {
      httpServer.off("error", reject);
      resolve();
    });
  });

  const addr = httpServer.address() as AddressInfo;
  const boundPort = addr.port;
  const boundHost = addr.address === "::" ? "127.0.0.1" : addr.address;

  return {
    httpServer,
    host: boundHost,
    port: boundPort,
    url: `http://${boundHost}:${boundPort}/mcp`,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
