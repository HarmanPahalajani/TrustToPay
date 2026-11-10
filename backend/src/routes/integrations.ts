import { Router } from "express";
import { prisma } from "../db.js";
import { config, configIssues } from "../config.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth, requireRole } from "../auth/middleware.js";
import { publicIntegrationStatus } from "../serializers.js";
import { audit } from "../lib/audit.js";
import { PayPalApiClient } from "../services/paypal/client.js";
import type { PayPalGateway } from "../services/paypal/client.js";
import { getPayPalGateway } from "../services/paypal/client.js";

import {
  getActiveElasticAdapter,
  getEmbeddingCacheStats,
  reindexAllApprovedSpecialists,
} from "../services/elastic/specialistIndexService.js";

const router = Router();

router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    res.json({
      ...publicIntegrationStatus(),
      issues: configIssues(),
      docs: {
        paypalSetup: "https://developer.paypal.com/api/rest/",
        paypalSandbox: "https://developer.paypal.com/tools/sandbox/",
        paypalWebhooks: "https://developer.paypal.com/api/rest/webhooks/",
      },
    });
  }),
);

/** Requester OAuth check. It obtains a token and moves no money. */
router.post(
  "/paypal/test-oauth",
  requireAuth,
  requireRole("REQUESTER"),
  asyncHandler(async (req, res) => {
    if (config.paymentsMode !== "SANDBOX") {
      throw new AppError(
        409,
        "DEMO_MODE_ACTIVE",
        "DEMO_MODE=true uses simulated payments. Set DEMO_MODE=false and configure Sandbox credentials to test genuine OAuth.",
      );
    }
    if (!config.paypalConfigured) {
      throw new AppError(
        503,
        "PAYPAL_NOT_CONFIGURED",
        "PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must both be configured.",
      );
    }

    const gateway = getPayPalGateway();
    if (!(gateway instanceof PayPalApiClient)) {
      // Tests may inject a fake gateway; report that instead of pretending.
      throw new AppError(409, "PAYPAL_TEST_UNAVAILABLE", "The active payment gateway does not support an OAuth test.");
    }

    const started = Date.now();
    await gateway.getAccessToken();
    const durationMs = Date.now() - started;
    await audit(prisma, req, {
      action: "PAYPAL_OAUTH_TESTED",
      entityType: "Integration",
      entityId: "paypal",
      metadata: { environment: "sandbox", durationMs },
    });
    res.json({
      ok: true,
      environment: "sandbox",
      durationMs,
      message:
        "PayPal Sandbox OAuth succeeded. This verifies credentials only; it does not confirm Checkout or Payouts permissions.",
      testedAt: new Date().toISOString(),
    });
  }),
);

router.get(
  "/elastic/health",
  asyncHandler(async (_req, res) => {
    const adapter = getActiveElasticAdapter();
    const isPingOk = await adapter.ping();
    const stats = adapter.getIndexStats
      ? await adapter.getIndexStats(config.elasticIndexSpecialists)
      : { exists: false, docCount: 0 };

    res.json({
      ok: isPingOk,
      enabled: config.elasticEnabled,
      configured: config.elasticConfigured,
      indexName: config.elasticIndexSpecialists,
      ping: isPingOk,
      stats,
      mode: config.elasticConfigured
        ? config.jinaConfigured
          ? "HYBRID_ELASTIC"
          : "KEYWORD_ELASTIC"
        : "DATABASE_FALLBACK",
      jinaConfigured: config.jinaConfigured,
      checkedAt: new Date().toISOString(),
    });
  }),
);

router.get(
  "/jina/health",
  asyncHandler(async (_req, res) => {
    res.json({
      ok: config.jinaConfigured,
      configured: config.jinaConfigured,
      model: config.jinaEmbeddingModel,
      targetDimensions: 1024,
      supportedTasks: ["retrieval.passage", "retrieval.query"],
      cache: getEmbeddingCacheStats(),
      checkedAt: new Date().toISOString(),
    });
  }),
);

router.post(
  "/elastic/reindex",
  requireAuth,
  asyncHandler(async (req, res) => {
    const started = Date.now();
    const outcome = await reindexAllApprovedSpecialists(prisma);
    const durationMs = Date.now() - started;

    await audit(prisma, req, {
      action: "ELASTIC_SPECIALISTS_REINDEXED",
      entityType: "Integration",
      entityId: "elasticsearch",
      metadata: { ...outcome, durationMs },
    });

    res.json({
      ...outcome,
      durationMs,
      reindexedAt: new Date().toISOString(),
    });
  }),
);

export default router;

export type { PayPalGateway };
