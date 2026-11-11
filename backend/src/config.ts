import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(here, "..");
const rootDir = path.resolve(backendDir, "..");

// In tests the environment is provided by the test setup; do not let a local
// .env override it. In normal runs the root .env is loaded first, then a
// backend-local .env can override individual values.
if (process.env.NODE_ENV !== "test") {
  const rootEnv = path.join(rootDir, ".env");
  const backendEnv = path.join(backendDir, ".env");
  if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  if (fs.existsSync(backendEnv)) dotenv.config({ path: backendEnv, override: true });
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function int(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanSecret(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/[\r\n]+/g, "").trim();
  }
  return trimmed.replace(/[\r\n]+/g, "").trim();
}

const ephemeralDevSecret = crypto.randomBytes(48).toString("hex");
let warnedAboutSecret = false;

/**
 * Configuration is exposed through getters rather than a frozen object so the
 * test suite can vary environment variables per test file without re-importing
 * the application. Validation is also evaluated lazily (see configIssues).
 */
export const config = {
  get nodeEnv(): string {
    return process.env.NODE_ENV ?? "development";
  },
  get isProduction(): boolean {
    return this.nodeEnv === "production";
  },
  get isTest(): boolean {
    return this.nodeEnv === "test";
  },
  get demoMode(): boolean {
    return bool(process.env.DEMO_MODE, true);
  },
  get demoUsersEnabled(): boolean {
    return bool(process.env.DEMO_USERS_ENABLED, true);
  },
  get port(): number {
    return int(process.env.PORT, 3000);
  },
  get frontendUrl(): string {
    return (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get apiBaseUrl(): string {
    return (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get databaseUrl(): string {
    return process.env.DATABASE_URL || "file:./dev.db";
  },
  get supabaseUrl(): string {
    return (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  },
  get supabaseAnonKey(): string {
    return (process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
  },
  get supabaseServiceRoleKey(): string {
    return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  },
  get supabaseJwtSecret(): string {
    return (process.env.SUPABASE_JWT_SECRET ?? "").trim();
  },
  get supabaseConfigured(): boolean {
    return Boolean(this.supabaseUrl && (this.supabaseAnonKey || this.supabaseServiceRoleKey));
  },
  get sessionSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length >= 32) return secret;
    if (this.isProduction) return secret ?? "";
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn(
        "[config] SESSION_SECRET is missing or shorter than 32 characters; using an ephemeral development secret. Sessions will reset when the server restarts. Run `npm run setup` to generate one.",
      );
    }
    return secret && secret.length > 0 ? `${secret}-${ephemeralDevSecret}` : ephemeralDevSecret;
  },
  get sessionCookieName(): string {
    return "hf_session";
  },
  get sessionTtlDays(): number {
    return 7;
  },
  get aiProvider(): string {
    return (process.env.AI_PROVIDER ?? "demo").trim().toLowerCase();
  },
  get aiApiKey(): string {
    return process.env.AI_API_KEY ?? "";
  },
  get aiBaseUrl(): string {
    return (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  },
  get aiModel(): string {
    return process.env.AI_MODEL ?? "";
  },
  get aiConfigured(): boolean {
    if (this.aiProvider === "demo") return false;
    if (this.aiProvider === "gemini") {
      return this.geminiConfigured;
    }
    if (this.aiProvider === "openai") {
      return (
        this.aiApiKey.length > 0 &&
        this.aiBaseUrl.length > 0 &&
        this.aiModel.length > 0
      );
    }
    return this.aiApiKey.length > 0;
  },
  get aiEscalationThreshold(): number {
    const value = Number.parseFloat(process.env.AI_ESCALATION_THRESHOLD ?? "0.75");
    if (!Number.isFinite(value) || value <= 0 || value > 1) return 0.75;
    return value;
  },
  get geminiApiKey(): string {
    return cleanSecret(process.env.GEMINI_API_KEY);
  },
  get geminiModel(): string {
    return (process.env.GEMINI_MODEL ?? "gemini-3.8-flash").trim() || "gemini-3.8-flash";
  },
  get geminiThinkingBudget(): number {
    return int(process.env.GEMINI_THINKING_BUDGET, 0);
  },
  get geminiFallbackModels(): string[] {
    const raw = process.env.GEMINI_FALLBACK_MODELS;
    if (raw === undefined) return ["gemini-3.6-flash", "gemini-3.7-flash"];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  },
  get geminiConfigured(): boolean {
    return this.geminiApiKey.length > 0;
  },
  get codeReviewEnabled(): boolean {
    return bool(process.env.CODE_REVIEW_ENABLED, true);
  },
  get codeReviewFailClosed(): boolean {
    return bool(process.env.CODE_REVIEW_FAIL_CLOSED, true);
  },
  get codeReviewTimeoutMs(): number {
    return Math.max(100, int(process.env.CODE_REVIEW_TIMEOUT_MS, 30_000));
  },
  get codeReviewMaxRetries(): number {
    return Math.max(0, Math.min(4, int(process.env.CODE_REVIEW_MAX_RETRIES, 2)));
  },
  get codeReviewRetryBaseMs(): number {
    return Math.max(25, Math.min(10_000, int(process.env.CODE_REVIEW_RETRY_BASE_MS, 750)));
  },
  get codeReviewMaxChunkChars(): number {
    return Math.max(2_000, Math.min(100_000, int(process.env.CODE_REVIEW_MAX_CHUNK_CHARS, 20_000)));
  },
  get codeReviewMaxChunks(): number {
    return Math.max(1, Math.min(20, int(process.env.CODE_REVIEW_MAX_CHUNKS, 8)));
  },
  get paypalEnv(): string {
    return (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase();
  },
  get paypalClientId(): string {
    return process.env.PAYPAL_CLIENT_ID ?? "";
  },
  get paypalClientSecret(): string {
    return process.env.PAYPAL_CLIENT_SECRET ?? "";
  },
  get paypalCredentialsPresent(): boolean {
    return this.paypalClientId.length > 0 && this.paypalClientSecret.length > 0;
  },
  /**
   * The payment mode is derived from DEMO_MODE, never from the browser.
   * SIMULATED means DemoPaymentProvider. SANDBOX means real PayPal REST calls.
   */
  get paymentsMode(): "SIMULATED" | "SANDBOX" {
    return this.demoMode ? "SIMULATED" : "SANDBOX";
  },
  get paypalConfigured(): boolean {
    return !this.demoMode && this.paypalCredentialsPresent && this.paypalEnv === "sandbox";
  },
  get paypalPayoutsRequested(): boolean {
    return bool(process.env.PAYPAL_PAYOUTS_ENABLED, false);
  },
  get paypalPayoutsEnabled(): boolean {
    return this.paypalConfigured && this.paypalPayoutsRequested;
  },
  get paypalWebhookId(): string {
    return process.env.PAYPAL_WEBHOOK_ID ?? "";
  },
  get paypalCurrency(): string {
    return (process.env.PAYPAL_CURRENCY ?? "USD").toUpperCase();
  },
  get rewardMinMinor(): number {
    return Math.max(1, int(process.env.REWARD_MIN_MINOR, 500));
  },
  get rewardMaxMinor(): number {
    return Math.max(this.rewardMinMinor, int(process.env.REWARD_MAX_MINOR, 10000));
  },
  get supportedCurrencies(): string[] {
    return ["USD"];
  },
  get elasticEnabled(): boolean {
    return bool(process.env.ELASTIC_ENABLED, false);
  },
  get elasticsearchUrl(): string {
    return (process.env.ELASTICSEARCH_URL ?? "").trim().replace(/\/$/, "");
  },
  get elasticsearchApiKey(): string {
    return (process.env.ELASTICSEARCH_API_KEY ?? "").trim();
  },
  get elasticIndexSpecialists(): string {
    return (process.env.ELASTIC_INDEX_SPECIALISTS ?? "trusttopay-specialists-v1").trim() || "trusttopay-specialists-v1";
  },
  get elasticTimeoutMs(): number {
    return Math.max(50, int(process.env.ELASTIC_TIMEOUT_MS, 2500));
  },
  get elasticConfigured(): boolean {
    return this.elasticEnabled && this.elasticsearchUrl.length > 0 && this.elasticsearchApiKey.length > 0;
  },
  get jinaApiKey(): string {
    return (process.env.JINA_API_KEY ?? "").trim();
  },
  get jinaEmbeddingModel(): string {
    return (process.env.JINA_EMBEDDING_MODEL ?? "jina-embeddings-v3").trim() || "jina-embeddings-v3";
  },
  get jinaConfigured(): boolean {
    return this.jinaApiKey.length > 0 && this.jinaEmbeddingModel.length > 0;
  },
  get resendApiKey(): string {
    return cleanSecret(process.env.RESEND_API_KEY);
  },
  get resendFromEmail(): string {
    const raw = cleanSecret(process.env.RESEND_FROM_EMAIL);
    return raw || "TrustToPay <onboarding@resend.dev>";
  },
  get resendConfigured(): boolean {
    return this.resendApiKey.length > 0;
  },
};

export type ConfigIssue = {
  level: "error" | "warning" | "info";
  code: string;
  message: string;
  hint?: string;
};

/** Non-fatal configuration reporting used by /health and the integration page. */
export function configIssues(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (config.isProduction && !process.env.SESSION_SECRET) {
    issues.push({
      level: "error",
      code: "SESSION_SECRET_MISSING",
      message: "SESSION_SECRET is required in production.",
      hint: "Generate a random 32+ character secret and set it in your platform's secret settings.",
    });
  }

  if (config.isProduction && config.demoMode) {
    issues.push({
      level: "error",
      code: "DEMO_MODE_IN_PRODUCTION",
      message: "DEMO_MODE must be false in production.",
      hint: "Simulated payments and demo logins are not allowed in production.",
    });
  }

  if (config.paypalEnv !== "sandbox") {
    issues.push({
      level: "error",
      code: "PAYPAL_LIVE_DISABLED",
      message: "Live PayPal payments are disabled in this build. PAYPAL_ENV must be sandbox.",
      hint: "This hackathon build intentionally refuses live-money transactions.",
    });
  }

  if (!config.demoMode && !config.paypalCredentialsPresent) {
    issues.push({
      level: "error",
      code: "PAYPAL_NOT_CONFIGURED",
      message:
        "DEMO_MODE=false requests genuine PayPal Sandbox payments, but PAYPAL_CLIENT_ID and/or PAYPAL_CLIENT_SECRET are missing.",
      hint: "Add both Sandbox credentials from developer.paypal.com, or set DEMO_MODE=true to use clearly labelled simulated payments.",
    });
  }

  if (!config.demoMode && config.paypalCredentialsPresent && config.paypalEnv !== "sandbox") {
    issues.push({
      level: "error",
      code: "PAYPAL_ENV_INVALID",
      message: "Only PAYPAL_ENV=sandbox is supported.",
    });
  }

  if (config.demoMode && config.paypalCredentialsPresent) {
    issues.push({
      level: "info",
      code: "PAYPAL_CREDS_IGNORED_IN_DEMO",
      message:
        "PayPal credentials are present, but DEMO_MODE=true keeps payments simulated. Set DEMO_MODE=false to make real Sandbox calls.",
    });
  }

  if (!config.demoMode && config.paypalConfigured && !config.paypalWebhookId) {
    issues.push({
      level: "warning",
      code: "PAYPAL_WEBHOOK_ID_MISSING",
      message:
        "PAYPAL_WEBHOOK_ID is not set, so incoming webhooks cannot be signature-verified and will be rejected.",
      hint: "Create a webhook in the PayPal Developer dashboard and copy its Webhook ID.",
    });
  }

  if (config.paypalPayoutsRequested && !config.paypalPayoutsEnabled) {
    issues.push({
      level: "warning",
      code: "PAYOUTS_NOT_READY",
      message:
        "PAYPAL_PAYOUTS_ENABLED=true but real Sandbox mode is not active (DEMO_MODE or credentials).",
    });
  }

  if (config.aiProvider === "gemini" && !config.geminiConfigured) {
    issues.push({
      level: "error",
      code: "GEMINI_NOT_CONFIGURED",
      message: "AI_PROVIDER=gemini is selected but GEMINI_API_KEY is missing.",
      hint: "Add GEMINI_API_KEY from Google AI Studio, or set AI_PROVIDER=demo for deterministic local analysis.",
    });
  } else if (config.aiProvider === "openai" && !config.aiConfigured) {
    issues.push({
      level: "error",
      code: "AI_PROVIDER_NOT_CONFIGURED",
      message: "AI_PROVIDER=openai is selected but AI_API_KEY, AI_BASE_URL, or AI_MODEL is missing.",
      hint: "Set all three provider variables, or set AI_PROVIDER=demo to use the deterministic demo engine.",
    });
  } else if (config.aiProvider !== "demo" && config.aiProvider !== "gemini" && config.aiProvider !== "openai" && !config.aiConfigured) {
    issues.push({
      level: "error",
      code: "AI_PROVIDER_NOT_CONFIGURED",
      message: `AI_PROVIDER=${config.aiProvider} is selected but required credentials are missing.`,
      hint: "Supported providers are 'demo', 'gemini', or 'openai'.",
    });
  }

  if (!config.supportedCurrencies.includes(config.paypalCurrency)) {
    issues.push({
      level: "error",
      code: "CURRENCY_UNSUPPORTED",
      message: `PAYPAL_CURRENCY=${config.paypalCurrency} is not enabled by this build (supported: ${config.supportedCurrencies.join(", ")}).`,
    });
  }

  if (config.elasticEnabled && !config.elasticConfigured) {
    issues.push({
      level: "warning",
      code: "ELASTIC_NOT_CONFIGURED",
      message:
        "ELASTIC_ENABLED=true but ELASTICSEARCH_URL and/or ELASTICSEARCH_API_KEY are missing. Specialist discovery will gracefully fall back to the relational database.",
      hint: "Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY on the server, or set ELASTIC_ENABLED=false.",
    });
  }

  if (config.elasticConfigured && !config.jinaConfigured) {
    issues.push({
      level: "warning",
      code: "JINA_NOT_CONFIGURED",
      message:
        "Elasticsearch is configured but JINA_API_KEY is missing. Specialist discovery will run in BM25 keyword mode without dense vector semantic ranking.",
      hint: "Add JINA_API_KEY to enable dense vector hybrid retrieval.",
    });
  }

  if (!config.resendConfigured) {
    issues.push({
      level: "info",
      code: "RESEND_NOT_CONFIGURED",
      message: "RESEND_API_KEY is not configured. Outbound email alerts will run in simulated dev mode.",
      hint: "Add RESEND_API_KEY from resend.com to enable real outbound email dispatch.",
    });
  }

  return issues;
}

export function configErrors(): ConfigIssue[] {
  return configIssues().filter((issue) => issue.level === "error");
}
