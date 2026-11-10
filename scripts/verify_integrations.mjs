#!/usr/bin/env node
/**
 * TrustToPay — Third-Party Staging & Sandbox Integration Verification Probe
 *
 * Checks live reachability, authentication, and endpoint contracts for:
 * 1. Supabase Authentication & Admin API
 * 2. Google Gemini Structured Security Gate (@google/genai)
 * 3. PayPal Sandbox REST API (OAuth & Order Lifecycle)
 * 4. Resend Email Dispatch API & Sender Verification
 * 5. Elasticsearch Specialist Discovery (if enabled)
 *
 * Rules:
 * - NEVER prints secret keys or sensitive tokens.
 * - If a credential is missing, marks status as [BLOCKED — CREDENTIALS PENDING].
 * - When credentials are provided, runs live API calls against sandbox/staging endpoints.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
};

function formatStatus(status) {
  if (status === "PASSED" || status === "VERIFIED") {
    return `${colors.green}${colors.bold}✔ ${status}${colors.reset}`;
  }
  if (status.includes("PENDING") || status.includes("NOT CONFIGURED")) {
    return `${colors.yellow}${colors.bold}⏳ ${status}${colors.reset}`;
  }
  if (status === "SKIPPED") {
    return `${colors.dim}⚪ ${status}${colors.reset}`;
  }
  return `${colors.red}${colors.bold}✖ ${status}${colors.reset}`;
}

const results = [];

async function testSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || (!anonKey && !serviceRoleKey)) {
    results.push({
      provider: "Supabase Auth",
      configured: false,
      status: "BLOCKED — CREDENTIALS PENDING",
      endpoint: url || "https://<project-ref>.supabase.co",
      notes: "Requires SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY",
    });
    return;
  }

  const start = Date.now();
  try {
    // Probe Supabase health endpoint
    const healthRes = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: anonKey || serviceRoleKey,
      },
    });

    const elapsed = Date.now() - start;
    if (healthRes.ok) {
      results.push({
        provider: "Supabase Auth",
        configured: true,
        status: "VERIFIED",
        endpoint: `${url}/auth/v1/health`,
        notes: `HTTP ${healthRes.status} (${elapsed}ms) - Auth API responsive and ready for PKCE/JWT`,
      });
    } else {
      results.push({
        provider: "Supabase Auth",
        configured: true,
        status: "FAILED",
        endpoint: `${url}/auth/v1/health`,
        notes: `HTTP ${healthRes.status}: ${await healthRes.text().catch(() => "Unknown error")}`,
      });
    }
  } catch (err) {
    results.push({
      provider: "Supabase Auth",
      configured: true,
      status: "FAILED",
      endpoint: url,
      notes: `Network error: ${err.message}`,
    });
  }
}

async function testGemini() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const model = (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();

  if (!apiKey) {
    results.push({
      provider: "Google Gemini",
      configured: false,
      status: "BLOCKED — CREDENTIALS PENDING",
      endpoint: "generativelanguage.googleapis.com",
      notes: "Requires GEMINI_API_KEY in .env",
    });
    return;
  }

  const start = Date.now();
  try {
    // Dynamic import of GoogleGenAI SDK
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "trusttopay-staging-verifier" },
        timeout: 10000,
      },
    });

    // Test with 4-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out after 4000ms")), 4000),
    );

    const callPromise = ai.models.generateContent({
      model,
      contents: "Inspect deliverable and reply with JSON: {\"verdict\":\"PASS\",\"riskLevel\":\"LOW\"}",
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
          },
          required: ["verdict", "riskLevel"],
        },
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const elapsed = Date.now() - start;
    const parsed = JSON.parse(response.text?.trim() || "{}");

    if (parsed.verdict && parsed.riskLevel) {
      results.push({
        provider: "Google Gemini",
        configured: true,
        status: "VERIFIED",
        endpoint: `Model: ${model}`,
        notes: `Structured schema verified (${elapsed}ms) - Verdict: ${parsed.verdict}`,
      });
    } else {
      results.push({
        provider: "Google Gemini",
        configured: true,
        status: "FAILED",
        endpoint: `Model: ${model}`,
        notes: `Response schema mismatch: ${response.text?.slice(0, 100)}`,
      });
    }
  } catch (err) {
    results.push({
      provider: "Google Gemini",
      configured: true,
      status: "FAILED",
      endpoint: `Model: ${model}`,
      notes: `API call failed: ${err.message?.slice(0, 120)}`,
    });
  }
}

async function testPayPalSandbox() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();
  const webhookId = (process.env.PAYPAL_WEBHOOK_ID || "").trim();

  if (!clientId || !clientSecret) {
    results.push({
      provider: "PayPal Sandbox",
      configured: false,
      status: "BLOCKED — CREDENTIALS PENDING",
      endpoint: "https://api-m.sandbox.paypal.com",
      notes: "Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET",
    });
    return;
  }

  const start = Date.now();
  try {
    // 1. Test OAuth token generation
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const authRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });

    if (!authRes.ok) {
      results.push({
        provider: "PayPal Sandbox",
        configured: true,
        status: "FAILED",
        endpoint: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        notes: `OAuth failed: HTTP ${authRes.status}`,
      });
      return;
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;
    const authElapsed = Date.now() - start;

    // 2. Test Order Creation in Sandbox
    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: "test-probe-001",
            description: "TrustToPay Staging Verification Probe Order",
            amount: { currency_code: "USD", value: "5.00" },
          },
        ],
      }),
    });

    if (orderRes.ok) {
      const orderData = await orderRes.json();
      results.push({
        provider: "PayPal Sandbox",
        configured: true,
        status: "VERIFIED",
        endpoint: "https://api-m.sandbox.paypal.com",
        notes: `OAuth OK (${authElapsed}ms) & Sandbox Order Created: ${orderData.id} (${orderData.status}) | Webhook ID: ${webhookId ? "Present" : "Missing"}`,
      });
    } else {
      results.push({
        provider: "PayPal Sandbox",
        configured: true,
        status: "FAILED",
        endpoint: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        notes: `OAuth succeeded but Order creation failed: HTTP ${orderRes.status}`,
      });
    }
  } catch (err) {
    results.push({
      provider: "PayPal Sandbox",
      configured: true,
      status: "FAILED",
      endpoint: "https://api-m.sandbox.paypal.com",
      notes: `Network error: ${err.message}`,
    });
  }
}

async function testResend() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || "TrustToPay <notifications@trusttopay.com>").trim();

  if (!apiKey) {
    results.push({
      provider: "Resend Email",
      configured: false,
      status: "BLOCKED — CREDENTIALS PENDING",
      endpoint: "https://api.resend.com",
      notes: "Requires RESEND_API_KEY. (Simulated delivery currently active in app).",
    });
    return;
  }

  const start = Date.now();
  try {
    // Probe Resend API key validity via domains list endpoint
    const res = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const elapsed = Date.now() - start;
    if (res.ok) {
      const domainsData = await res.json();
      const verifiedDomains = Array.isArray(domainsData.data)
        ? domainsData.data.map((d) => `${d.name} (${d.status})`).join(", ")
        : "None";

      results.push({
        provider: "Resend Email",
        configured: true,
        status: "VERIFIED",
        endpoint: "https://api.resend.com/domains",
        notes: `API Auth valid (${elapsed}ms). From: ${fromEmail}. Verified domains: [${verifiedDomains}]`,
      });
    } else {
      const errText = await res.text();
      results.push({
        provider: "Resend Email",
        configured: true,
        status: "FAILED",
        endpoint: "https://api.resend.com",
        notes: `HTTP ${res.status}: ${errText.slice(0, 140)}`,
      });
    }
  } catch (err) {
    results.push({
      provider: "Resend Email",
      configured: true,
      status: "FAILED",
      endpoint: "https://api.resend.com",
      notes: `Network error: ${err.message}`,
    });
  }
}

async function testElasticsearch() {
  const enabled = process.env.ELASTIC_ENABLED === "true";
  const url = (process.env.ELASTICSEARCH_URL || "").trim();
  const apiKey = (process.env.ELASTICSEARCH_API_KEY || "").trim();

  if (!enabled) {
    results.push({
      provider: "Elasticsearch",
      configured: false,
      status: "SKIPPED",
      endpoint: "Local SQLite DB Fallback",
      notes: "ELASTIC_ENABLED=false (Relational DB specialist matching is active)",
    });
    return;
  }

  if (!url || !apiKey) {
    results.push({
      provider: "Elasticsearch",
      configured: false,
      status: "BLOCKED — CREDENTIALS PENDING",
      endpoint: url || "ELASTICSEARCH_URL not set",
      notes: "ELASTIC_ENABLED=true but ELASTICSEARCH_URL or ELASTICSEARCH_API_KEY missing",
    });
    return;
  }

  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `ApiKey ${apiKey}`,
      },
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      results.push({
        provider: "Elasticsearch",
        configured: true,
        status: "VERIFIED",
        endpoint: url,
        notes: `Cluster responsive (${elapsed}ms)`,
      });
    } else {
      results.push({
        provider: "Elasticsearch",
        configured: true,
        status: "FAILED",
        endpoint: url,
        notes: `HTTP ${res.status}: ${await res.text()}`,
      });
    }
  } catch (err) {
    results.push({
      provider: "Elasticsearch",
      configured: true,
      status: "FAILED",
      endpoint: url,
      notes: `Cluster unreachable: ${err.message}`,
    });
  }
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   TRUSTTOPAY — STAGING & THIRD-PARTY INTEGRATION PROBE          ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  console.log(`Auditing active configuration...\n`);

  await testSupabase();
  await testGemini();
  await testPayPalSandbox();
  await testResend();
  await testElasticsearch();

  console.log(`${"-".repeat(85)}`);
  console.log(
    `| ${"Provider".padEnd(18)} | ${"Status".padEnd(30)} | ${"Details".padEnd(30)} |`,
  );
  console.log(`${"-".repeat(85)}`);

  for (const r of results) {
    const providerStr = r.provider.padEnd(18);
    const statusStr = formatStatus(r.status).padEnd(38); // extra chars for ANSI colors
    const detailsStr = r.notes.slice(0, 30).padEnd(30);
    console.log(`| ${providerStr} | ${statusStr} | ${detailsStr} |`);
  }
  console.log(`${"-".repeat(85)}\n`);

  const pending = results.filter((r) => r.status.includes("PENDING"));
  const verified = results.filter((r) => r.status === "VERIFIED");
  const failed = results.filter((r) => r.status === "FAILED");

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  • Verified Live:     ${verified.length}`);
  console.log(`  • Pending Setup:     ${pending.length}`);
  console.log(`  • Failed Checks:     ${failed.length}`);

  if (pending.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Awaiting credentials for:${colors.reset}`);
    for (const p of pending) {
      console.log(`  - ${p.provider}: ${p.notes}`);
    }
  }

  console.log(`\n${colors.dim}Run this script anytime with: npm run test:integrations${colors.reset}\n`);
}

main().catch((err) => {
  console.error("Probe script error:", err);
  process.exit(1);
});
