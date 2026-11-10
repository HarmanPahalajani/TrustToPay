import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env");
if (!fs.existsSync(envPath)) {
  console.error("No .env file found at root.");
  process.exit(1);
}

const content = fs.readFileSync(envPath, "utf-8");
const lines = content.split(/\r?\n/);
const env = {};

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Remove inline comment if bare
    if (val.includes(" #")) {
      val = val.split(" #")[0].trim();
    }
    env[match[1]] = val;
  }
}

const SCHEMA = [
  // 1. Core
  { name: "PORT", scope: "backend", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "DATABASE_URL", scope: "backend", required: true, validate: (v) => v.length > 0 },
  { name: "FRONTEND_URL", scope: "backend", required: true, validate: (v) => /^https?:\/\//.test(v) },
  { name: "API_BASE_URL", scope: "backend", required: true, validate: (v) => /^https?:\/\//.test(v) },
  { name: "SESSION_SECRET", scope: "backend", required: true, validate: (v) => v.length >= 16 },
  { name: "DEMO_MODE", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },
  { name: "DEMO_USERS_ENABLED", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },

  // 2. Gemini
  { name: "AI_PROVIDER", scope: "backend", required: true, validate: (v) => ["gemini", "demo", "openai"].includes(v.toLowerCase()) },
  { name: "GEMINI_API_KEY", scope: "backend", required: true, validate: (v) => v.length > 10 && !v.includes("placeholder") },
  { name: "GEMINI_MODEL", scope: "backend", required: true, validate: (v) => v.length > 3 },
  { name: "AI_ESCALATION_THRESHOLD", scope: "backend", required: true, validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 1 },
  { name: "AI_API_KEY", scope: "backend", required: false, validate: () => true },
  { name: "AI_BASE_URL", scope: "backend", required: false, validate: () => true },
  { name: "AI_MODEL", scope: "backend", required: false, validate: () => true },

  // 3. Jina
  { name: "JINA_API_KEY", scope: "backend", required: true, validate: (v) => v.length > 10 && !v.includes("placeholder") },
  { name: "JINA_EMBEDDING_MODEL", scope: "backend", required: true, validate: (v) => v === "jina-embeddings-v3" },

  // 4. Elasticsearch
  { name: "ELASTIC_ENABLED", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },
  { name: "ELASTICSEARCH_URL", scope: "backend", required: true, validate: (v) => /^https?:\/\//.test(v) },
  { name: "ELASTICSEARCH_API_KEY", scope: "backend", required: true, validate: (v) => v.length > 10 && !v.includes("placeholder") },
  { name: "ELASTIC_INDEX_SPECIALISTS", scope: "backend", required: true, validate: (v) => /^[a-z0-9_-]+$/.test(v) },
  { name: "ELASTIC_TIMEOUT_MS", scope: "backend", required: true, validate: (v) => /^\d+$/.test(v) },

  // 5. PayPal
  { name: "PAYPAL_ENV", scope: "backend", required: true, validate: (v) => v.toLowerCase() === "sandbox" },
  { name: "PAYPAL_CLIENT_ID", scope: "backend", required: true, validate: (v) => v.length > 10 && !v.includes("placeholder") },
  { name: "PAYPAL_CLIENT_SECRET", scope: "backend", required: true, validate: (v) => v.length > 10 && !v.includes("placeholder") },
  { name: "PAYPAL_WEBHOOK_ID", scope: "backend", required: false, validate: (v) => v.length === 0 || v.length > 5 },
  { name: "PAYPAL_CURRENCY", scope: "backend", required: true, validate: (v) => v.toUpperCase() === "USD" },
  { name: "PAYPAL_PAYOUTS_ENABLED", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },

  // 6. Supabase
  { name: "SUPABASE_URL", scope: "backend", required: true, validate: (v) => /^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(v) || /^https?:\/\//.test(v) },
  { name: "SUPABASE_ANON_KEY", scope: "backend", required: true, validate: (v) => v.length > 10 },
  { name: "SUPABASE_SERVICE_ROLE_KEY", scope: "backend", required: false, validate: (v) => v.length > 10 },
  { name: "SUPABASE_JWT_SECRET", scope: "backend", required: false, validate: (v) => v.length >= 16 },
  { name: "VITE_SUPABASE_URL", scope: "frontend", required: true, validate: (v) => /^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(v) || /^https?:\/\//.test(v) },
  { name: "VITE_SUPABASE_ANON_KEY", scope: "frontend", required: true, validate: (v) => v.length > 10 },

  // 7. Resend
  { name: "RESEND_API_KEY", scope: "backend", required: true, validate: (v) => (v.startsWith("re_") || v.length > 10) && !v.includes("placeholder") },
  { name: "RESEND_FROM_EMAIL", scope: "backend", required: true, validate: (v) => v.includes("@") },

  // 8. Code Review & Limits
  { name: "CODE_REVIEW_ENABLED", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },
  { name: "CODE_REVIEW_FAIL_CLOSED", scope: "backend", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },
  { name: "CODE_REVIEW_TIMEOUT_MS", scope: "backend", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "REWARD_MIN_MINOR", scope: "backend", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "REWARD_MAX_MINOR", scope: "backend", required: true, validate: (v) => /^\d+$/.test(v) },

  // 9. MCP Server
  { name: "TRUSTTOPAY_API_BASE_URL", scope: "mcp", required: true, validate: (v) => /^https?:\/\//.test(v) },
  { name: "TRUSTTOPAY_AGENT_API_KEY", scope: "mcp", required: false, validate: () => true },
  { name: "TRUSTTOPAY_MCP_TRANSPORT", scope: "mcp", required: true, validate: (v) => ["stdio", "sse", "http"].includes(v) },
  { name: "TRUSTTOPAY_MCP_HOST", scope: "mcp", required: true, validate: (v) => v.length > 0 },
  { name: "TRUSTTOPAY_MCP_PORT", scope: "mcp", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "TRUSTTOPAY_MCP_ALLOWED_ORIGINS", scope: "mcp", required: false, validate: () => true },
  { name: "TRUSTTOPAY_MCP_MIN_BUDGET_MINOR", scope: "mcp", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "TRUSTTOPAY_MCP_MAX_BUDGET_MINOR", scope: "mcp", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "TRUSTTOPAY_MCP_RATE_LIMIT_PER_MINUTE", scope: "mcp", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "TRUSTTOPAY_MCP_TIMEOUT_MS", scope: "mcp", required: true, validate: (v) => /^\d+$/.test(v) },
  { name: "TRUSTTOPAY_MCP_AUTO_DISPATCH", scope: "mcp", required: true, validate: (v) => ["true", "false"].includes(v.toLowerCase()) },
];

console.log(JSON.stringify(
  SCHEMA.map((item) => {
    const raw = env[item.name];
    let status = "NOT SET";
    let detail = "";

    if (raw !== undefined && raw !== "") {
      const isValid = item.validate(raw);
      if (isValid) {
        status = "SET";
      } else {
        status = "INVALID";
        detail = "Format does not match requirements";
      }
    } else {
      if (["PAYPAL_WEBHOOK_ID", "TRUSTTOPAY_AGENT_API_KEY", "SUPABASE_JWT_SECRET", "AI_API_KEY", "AI_BASE_URL", "AI_MODEL"].includes(item.name)) {
        status = "PENDING";
        detail = "Optional or pending staging deployment";
      } else if (!item.required) {
        status = "PENDING";
      } else {
        status = "NOT SET";
      }
    }

    return {
      variable: item.name,
      scope: item.scope,
      status,
      detail,
    };
  }),
  null,
  2
));
