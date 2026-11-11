import { describe, expect, it } from "vitest";
import { config } from "../../config.js";
import { verifySupabaseToken } from "../../auth/supabase.js";
import { PayPalApiClient } from "../../services/paypal/client.js";
import { sendEmail } from "../../services/notifications/email.js";
import { runLayeredGeminiSecurityGate } from "../../services/security/geminiReviewService.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../fixtures/security");

/**
 * Phase 4 — Staging & Sandbox Live Integration Test Suite
 *
 * NOTE: These tests verify genuine live endpoints against third-party providers.
 * Each test conditionally executes ONLY when actual credentials are configured in the environment.
 * When credentials are not present, tests are cleanly marked as skipped, preventing false failures.
 */
describe("Phase 4 — Live Third-Party Staging & Sandbox Integrations", () => {
  describe("1. Supabase Authentication Integration", () => {
    const isSupabaseReady = Boolean(config.supabaseConfigured && config.supabaseUrl);

    it.runIf(isSupabaseReady)(
      "[LIVE] verifies Supabase Auth API health and token verification endpoint",
      async () => {
        const healthUrl = `${config.supabaseUrl}/auth/v1/health`;
        const res = await fetch(healthUrl, {
          headers: {
            apikey: config.supabaseServiceRoleKey || config.supabaseAnonKey,
          },
        });

        expect(res.status).toBe(200);

        // Verify that invalid tokens are rejected with null without throwing
        const invalidVerification = await verifySupabaseToken("invalid.token.here");
        expect(invalidVerification).toBeNull();
      },
    );

    it.skipIf(isSupabaseReady)(
      "[PENDING CREDENTIALS] Supabase live integration test awaiting SUPABASE_URL and SUPABASE_ANON_KEY",
      () => {
        // Placeholder indicating credential dependency
        expect(config.supabaseConfigured).toBe(false);
      },
    );
  });

  describe("2. Google Gemini Security Gate Integration", () => {
    const isGeminiReady = Boolean(config.geminiConfigured);

    it.runIf(isGeminiReady)(
      "[LIVE] executes live structured security review on approved and blocked deliverables",
      async () => {
        const approvedContent = fs.readFileSync(
          path.join(fixturesDir, "approved-deliverable.ts"),
          "utf-8",
        );
        const blockedContent = fs.readFileSync(
          path.join(fixturesDir, "blocked-deliverable.ts"),
          "utf-8",
        );

        // 1. Test approved code artifact
        const approvedResult = await runLayeredGeminiSecurityGate({
          taskQuestion: "Implement constant-time HMAC signature verification",
          acceptanceCriteria: "Use crypto.timingSafeEqual and handle replay window",
          artifactVersion: 1,
          artifactSha256: "sha256-approved-test",
          files: [{ path: "src/webhookAuth.ts", content: approvedContent }],
          forceGeminiCall: true,
        });

        expect(["PASS", "NEEDS_HUMAN_REVIEW"]).toContain(approvedResult.verdict);
        expect(approvedResult.engine).toBe("GEMINI_SDK");

        // 2. Test blocked deliverable
        const blockedResult = await runLayeredGeminiSecurityGate({
          taskQuestion: "Implement webhook handler",
          acceptanceCriteria: "Secure webhook processing",
          artifactVersion: 1,
          artifactSha256: "sha256-blocked-test",
          files: [{ path: "src/malicious.ts", content: blockedContent }],
          forceGeminiCall: true,
        });

        expect(blockedResult.verdict).toBe("BLOCK");
        expect(blockedResult.riskLevel).toBe("CRITICAL");
      },
      60_000,
    );

    it.runIf(isGeminiReady)(
      "[LIVE] executes live structured session confidence evaluation via Gemini",
      async () => {
        const { analyzeTask } = await import("../../services/ai/index.js");
        const analysisResult = await analyzeTask({
          category: "USB_C_COMPATIBILITY",
          question: "Is this 65W charger compatible with a 45W USB PD laptop?",
          productModels: ["MiniBook 11", "PowerVolt 65"],
          specifications: ["Laptop input: 45W USB PD via Type-C."],
          documents: [
            {
              title: "PowerVolt 65 Specs",
              sourceType: "MANUFACTURER",
              content: "Outputs 5V/3A, 9V/3A, 15V/3A, 20V/3.25A (65W max). Backward compatible with 45W USB PD.",
            },
          ],
        });

        expect(analysisResult.engine).toBe("provider");
        expect(analysisResult.provider).toBe("gemini");
        expect(analysisResult.output.summary).toBeDefined();
        expect(analysisResult.output.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(analysisResult.output.confidenceScore).toBeLessThanOrEqual(1);
      },
      45_000,
    );

    it.skipIf(isGeminiReady)(
      "[PENDING CREDENTIALS] Gemini live security gate test awaiting valid GEMINI_API_KEY",
      () => {
        expect(config.geminiConfigured).toBe(false);
      },
    );
  });

  describe("3. PayPal Sandbox Payment Gateway", () => {
    const isPayPalReady = Boolean(config.paypalCredentialsPresent && config.paypalEnv === "sandbox");

    it.runIf(isPayPalReady)(
      "[LIVE] generates genuine OAuth access token and verifies Sandbox Order creation",
      async () => {
        const client = new PayPalApiClient({
          clientId: config.paypalClientId,
          clientSecret: config.paypalClientSecret,
          webhookId: config.paypalWebhookId,
        });

        // 1. Live OAuth
        const token = await client.getAccessToken();
        expect(token).toBeDefined();
        expect(token.length).toBeGreaterThan(20);

        // 2. Live Order Creation
        const order = await client.createOrder({
          amountMinor: 500,
          currency: "USD",
          referenceId: "staging-test-task-001",
          description: "TrustToPay Staging Sandbox Verification Order",
          requestId: `req-${Date.now()}`,
        });

        expect(order.orderId).toBeDefined();
        expect(["CREATED", "PAYER_ACTION_REQUIRED"]).toContain(order.status);

        // 3. Verify getOrder
        const fetchedOrder = await client.getOrder(order.orderId);
        expect(fetchedOrder.orderId).toBe(order.orderId);
        expect(["CREATED", "PAYER_ACTION_REQUIRED"]).toContain(fetchedOrder.status);
      },
    );

    it.skipIf(isPayPalReady)(
      "[PENDING CREDENTIALS] PayPal Sandbox live integration test awaiting PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET",
      () => {
        expect(config.paypalCredentialsPresent).toBe(false);
      },
    );
  });

  describe("4. Resend Outbound Email Gateway", () => {
    const isResendReady = Boolean(config.resendConfigured);

    it.runIf(isResendReady)(
      "[LIVE] authenticates with Resend API and verifies delivery via delivered@resend.dev",
      async () => {
        const res = await fetch("https://api.resend.com/domains", {
          headers: {
            Authorization: `Bearer ${config.resendApiKey}`,
          },
        });

        const data = (await res.json().catch(() => ({}))) as { name?: string };
        expect(res.status === 200 || data.name === "restricted_api_key").toBe(true);

        const delivery = await sendEmail({
          to: "delivered@resend.dev",
          subject: "TrustToPay Live Integration Test",
          html: "<p>Verified Resend delivery path.</p>",
        });
        expect(delivery.success).toBe(true);
        expect(delivery.simulated).not.toBe(true);
        expect(delivery.id).toBeDefined();
      },
    );

    it.skipIf(isResendReady)(
      "[PENDING CREDENTIALS] Resend live email integration test awaiting RESEND_API_KEY",
      () => {
        expect(config.resendConfigured).toBe(false);
      },
    );
  });
});
