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
  const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
  const model = (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();
  const timeoutMs = Math.max(10_000, Number.parseInt(process.env.CODE_REVIEW_TIMEOUT_MS || "30000", 10) || 30_000);

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
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "trusttopay-staging-verifier" },
        timeout: timeoutMs,
      },
    });

    const candidateModels = Array.from(new Set([model, "gemini-3.6-flash", "gemini-3.7-flash"]));
    let lastErr = null;
    let primaryNote = "";

    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const candidateModel = candidateModels[mIdx];
      const thinkingConfig = candidateModel.includes("3.6")
        ? { thinkingLevel: "MINIMAL" }
        : { thinkingBudget: 0 };

      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        let timer;
        try {
          const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => {
              const err = new Error(`Request timed out after ${timeoutMs}ms`);
              err.name = "TimeoutError";
              controller.abort(err);
              reject(err);
            }, timeoutMs);
          });

          const callPromise = ai.models.generateContent({
            model: candidateModel,
            contents: "Inspect deliverable: export const add = (a: number, b: number) => a + b;",
            config: {
              systemInstruction: "Classify deliverable security risk as JSON only.",
              temperature: 0.1,
              maxOutputTokens: 512,
              responseMimeType: "application/json",
              abortSignal: controller.signal,
              thinkingConfig,
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  verdict: { type: Type.STRING, enum: ["PASS", "BLOCK", "NEEDS_HUMAN_REVIEW"] },
                  riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                },
                required: ["verdict", "riskLevel"],
              },
            },
          });

          const response = await Promise.race([callPromise, timeoutPromise]);
          clearTimeout(timer);
          const elapsed = Date.now() - start;
          const parsed = JSON.parse(response.text?.trim() || "{}");

          if (parsed.verdict && parsed.riskLevel) {
            results.push({
              provider: "Google Gemini",
              configured: true,
              status: "VERIFIED",
              endpoint: primaryNote ? `Fallback: ${candidateModel}` : `Model: ${candidateModel}`,
              notes: `${primaryNote ? `${primaryNote}; ` : ""}Verified (${elapsed}ms, attempt ${attempt}) - Verdict: ${parsed.verdict}`,
            });
          } else {
            results.push({
              provider: "Google Gemini",
              configured: true,
              status: "FAILED",
              endpoint: `Model: ${candidateModel}`,
              notes: `Response schema mismatch: ${response.text?.slice(0, 100)}`,
            });
          }
          return;
        } catch (err) {
          clearTimeout(timer);
          lastErr = err;
          const msg = String(err?.message || "");
          const isRateLimit = err?.status === 429 || /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg);
          const isTransient = err?.status === 503 || err?.status === 504 || /503|504|DEADLINE_EXCEEDED|UNAVAILABLE/i.test(msg);

          if (isTransient && attempt < 2) {
            await new Promise((r) => setTimeout(r, 750));
            continue;
          }
          if ((isRateLimit || isTransient) && mIdx < candidateModels.length - 1) {
            primaryNote = `${candidateModel} hit HTTP ${err?.status ?? (isRateLimit ? 429 : 504)}`;
            break;
          }
          throw err;
        }
      }
    }
    throw lastErr;
  } catch (err) {
    results.push({
      provider: "Google Gemini",
      configured: true,
      status: "FAILED",
      endpoint: `Model: ${model}`,
      notes: `API call failed (${err?.status ?? "err"}): ${String(err?.message || err).slice(0, 140)}`,
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
  const apiKey = (process.env.RESEND_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
  const fromEmail = (process.env.RESEND_FROM_EMAIL || "TrustToPay <onboarding@resend.dev>").trim();

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
    // 1. Probe domains endpoint (full-access keys return 200; sending-only keys return 401 restricted_api_key)
    const domRes = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const elapsed = Date.now() - start;
    if (domRes.ok) {
      const domainsData = await domRes.json();
      const verifiedDomains = Array.isArray(domainsData.data)
        ? domainsData.data.map((d) => `${d.name} (${d.status})`).join(", ")
        : "None";

      results.push({
        provider: "Resend Email",
        configured: true,
        status: "VERIFIED",
        endpoint: "https://api.resend.com/domains",
        notes: `Full-access key OK (${elapsed}ms). From: ${fromEmail}. Domains: [${verifiedDomains}]`,
      });
      return;
    }

    const domErrText = await domRes.text();
    let domErrJson = {};
    try {
      domErrJson = JSON.parse(domErrText);
    } catch {
      // non-JSON response
    }

    // 2. Sending-only keys cannot call /domains; validate directly with Resend's safe test sink delivered@resend.dev
    if (domRes.status === 401 && domErrJson.name === "restricted_api_key") {
      const sendStart = Date.now();
      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: ["delivered@resend.dev"],
          subject: "TrustToPay Integration Probe",
          html: "<p>Live Resend sending-only key check to delivered@resend.dev.</p>",
        }),
      });
      const sendElapsed = Date.now() - sendStart;

      if (sendRes.ok) {
        const sendData = await sendRes.json().catch(() => ({}));
        results.push({
          provider: "Resend Email",
          configured: true,
          status: "VERIFIED",
          endpoint: "https://api.resend.com/emails",
          notes: `Sending-only key OK (${sendElapsed}ms, id=${sendData.id || "ok"}). From: ${fromEmail} (test/verified recipients)`,
        });
      } else {
        const sendErrText = await sendRes.text();
        results.push({
          provider: "Resend Email",
          configured: true,
          status: "FAILED",
          endpoint: "https://api.resend.com/emails",
          notes: `Sending-only key failed POST /emails HTTP ${sendRes.status}: ${sendErrText.slice(0, 140)}`,
        });
      }
      return;
    }

    results.push({
      provider: "Resend Email",
      configured: true,
      status: "FAILED",
      endpoint: "https://api.resend.com",
      notes: `HTTP ${domRes.status}: ${domErrText.slice(0, 140)}`,
    });
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
