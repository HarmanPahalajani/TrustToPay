import crypto from "node:crypto";

export const AGENT_KEY_PATTERN = /^ttp_(?:live|test)_[A-Za-z0-9_-]{16,128}$/;

export interface McpAuthConfig {
  /** Default agent API key used for STDIO or fallback when configured */
  defaultAgentApiKey?: string;
  /** Minimum allowed task budget in minor units (cents). Default: 500 ($5.00) */
  minBudgetMinor: number;
  /** Maximum allowed task budget in minor units (cents). Default: 50000 ($500.00) */
  maxBudgetMinor: number;
  /** Maximum tool invocations per agent key per 60-second window. Default: 60 */
  rateLimitPerMinute: number;
  /** Allowed HTTP Origins for Streamable HTTP transport (empty = localhost origins allowed) */
  allowedOrigins: string[];
}

export interface AuthenticatedAgentContext {
  agentApiKey: string;
  keyPrefix: string;
  keyFingerprint: string;
  correlationId: string;
}

export class McpSecurityError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode = 403) {
    super(message);
    this.name = "McpSecurityError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function loadMcpAuthConfig(env: NodeJS.ProcessEnv = process.env): McpAuthConfig {
  const minBudgetMinor = Math.max(100, Number.parseInt(env.TRUSTTOPAY_MCP_MIN_BUDGET_MINOR ?? "500", 10) || 500);
  const maxBudgetMinor = Math.max(
    minBudgetMinor,
    Number.parseInt(env.TRUSTTOPAY_MCP_MAX_BUDGET_MINOR ?? "50000", 10) || 50000,
  );
  const rateLimitPerMinute = Math.max(
    1,
    Number.parseInt(env.TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE ?? "60", 10) || 60,
  );
  const allowedOrigins = (env.TRUSTTOPAY_MCP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    defaultAgentApiKey: env.TRUSTTOPAY_AGENT_API_KEY?.trim() || undefined,
    minBudgetMinor,
    maxBudgetMinor,
    rateLimitPerMinute,
    allowedOrigins,
  };
}

export function generateCorrelationId(): string {
  return `ttp-mcp-${crypto.randomBytes(6).toString("hex")}`;
}

export function validateAgentApiKeyFormat(rawKey: string | undefined | null): string {
  const trimmed = (rawKey ?? "").trim();
  if (!trimmed) {
    throw new McpSecurityError(
      "AGENT_AUTH_REQUIRED",
      "Missing TrustToPay Agent API key. Supply TRUSTTOPAY_AGENT_API_KEY or an Authorization: Bearer ttp_... header.",
      401,
    );
  }
  if (!AGENT_KEY_PATTERN.test(trimmed)) {
    throw new McpSecurityError(
      "INVALID_AGENT_API_KEY",
      "Invalid TrustToPay Agent API key format. Expected a key starting with 'ttp_live_' or 'ttp_test_'.",
      401,
    );
  }
  return trimmed;
}

export function extractBearerToken(authorizationHeader?: string | string[] | null): string | undefined {
  const raw = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
  if (!raw || typeof raw !== "string") return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match ? match[1].trim() : undefined;
}

export function resolveAgentContext(
  config: McpAuthConfig,
  overrideApiKey?: string | null,
  correlationId = generateCorrelationId(),
): AuthenticatedAgentContext {
  const key = validateAgentApiKeyFormat(overrideApiKey ?? config.defaultAgentApiKey);
  const keyFingerprint = crypto.createHash("sha256").update(key).digest("hex").slice(0, 12);
  const keyPrefix = key.slice(0, 14);
  return {
    agentApiKey: key,
    keyPrefix,
    keyFingerprint,
    correlationId,
  };
}

export function enforceServerBudgetPolicy(
  budgetMinor: number,
  config: McpAuthConfig,
): void {
  if (!Number.isInteger(budgetMinor) || budgetMinor <= 0) {
    throw new McpSecurityError(
      "INVALID_BUDGET_AMOUNT",
      "budgetMax must be a positive integer in USD minor units (cents).",
      400,
    );
  }
  if (budgetMinor < config.minBudgetMinor || budgetMinor > config.maxBudgetMinor) {
    throw new McpSecurityError(
      "BUDGET_POLICY_VIOLATION",
      `Requested budgetMax (${budgetMinor} minor units) violates server-enforced policy bounds (${config.minBudgetMinor}..${config.maxBudgetMinor} minor units). Agent-supplied arguments cannot override server budget policy.`,
      403,
    );
  }
}

export function validateHttpOrigin(
  originHeader: string | undefined,
  config: McpAuthConfig,
): void {
  if (!originHeader) {
    // Non-browser MCP CLI / SDK clients frequently omit Origin header
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(originHeader);
  } catch {
    throw new McpSecurityError("INVALID_ORIGIN", "Malformed Origin header.", 403);
  }

  const isLocalhost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1" ||
    parsed.hostname === "[::1]";

  if (config.allowedOrigins.length === 0) {
    if (!isLocalhost) {
      throw new McpSecurityError(
        "ORIGIN_NOT_ALLOWED",
        `Origin '${originHeader}' is not permitted by MCP server policy.`,
        403,
      );
    }
    return;
  }

  const normalized = `${parsed.protocol}//${parsed.host}`;
  if (!config.allowedOrigins.includes(normalized) && !config.allowedOrigins.includes(originHeader)) {
    throw new McpSecurityError(
      "ORIGIN_NOT_ALLOWED",
      `Origin '${originHeader}' is not in TRUSTTOPAY_MCP_ALLOWED_ORIGINS.`,
      403,
    );
  }
}

/**
 * Sliding-window per-agent rate limiter keyed by SHA-256 fingerprint of the agent API key.
 */
export class AgentRateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limitPerMinute: number;
  private readonly windowMs: number;

  constructor(limitPerMinute = 60, windowMs = 60_000) {
    this.limitPerMinute = limitPerMinute;
    this.windowMs = windowMs;
  }

  public checkAndRecord(keyFingerprint: string, now = Date.now()): void {
    const cutoff = now - this.windowMs;
    const existing = (this.hits.get(keyFingerprint) ?? []).filter((ts) => ts > cutoff);
    if (existing.length >= this.limitPerMinute) {
      this.hits.set(keyFingerprint, existing);
      throw new McpSecurityError(
        "RATE_LIMIT_EXCEEDED",
        `Agent rate limit exceeded (${this.limitPerMinute} requests per ${Math.round(this.windowMs / 1000)}s).`,
        429,
      );
    }
    existing.push(now);
    this.hits.set(keyFingerprint, existing);
  }

  public reset(): void {
    this.hits.clear();
  }
}

export interface McpAuditEntry {
  timestamp: string;
  correlationId: string;
  toolName: string;
  keyPrefix: string;
  keyFingerprint: string;
  taskId?: string;
  outcome: "SUCCESS" | "ERROR";
  errorCode?: string;
  durationMs: number;
}

/**
 * Writes structured JSON audit records exclusively to stderr so STDIO MCP streams on stdout
 * are never corrupted. Never logs raw API keys or secrets.
 */
export function writeMcpAuditLog(
  entry: McpAuditEntry,
  logger: (line: string) => void = (line) => process.stderr.write(`${line}\n`),
): void {
  const safeRecord = {
    service: "trusttopay-mcp",
    ...entry,
  };
  logger(JSON.stringify(safeRecord));
}
