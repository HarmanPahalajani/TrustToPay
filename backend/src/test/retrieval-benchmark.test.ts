import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app, agent, loginAs, resetDatabase, seedDemoUsers } from "./helpers.js";
import {
  BENCHMARK_SPECIALISTS,
  BENCHMARK_TASKS,
  runCombinedHybrid,
  runDatabaseKeywordOnly,
  runElasticBM25Only,
  runFullRetrievalBenchmark,
  runJinaSemanticOnly,
} from "../services/elastic/retrievalBenchmark.js";
import {
  clearEmbeddingCache,
  getEmbeddingCacheStats,
  JinaHttpEmbeddingProvider,
  setElasticAdaptersForTesting,
  type ElasticTransportAdapter,
  type EmbeddingProvider,
  type SanitizedSpecialistDocument,
} from "../services/elastic/specialistIndexService.js";
import { config } from "../config.js";

describe("Sponsor Integration Benchmark & Verification (Jina AI + Elasticsearch)", () => {
  beforeEach(async () => {
    await resetDatabase();
    clearEmbeddingCache();
  });

  afterEach(() => {
    clearEmbeddingCache();
    setElasticAdaptersForTesting({});
    vi.restoreAllMocks();
  });

  describe("Benchmark 4-Way Strategy Evaluation", () => {
    it("compares DB keyword, BM25, Jina semantic, and Combined hybrid retrieval quality", () => {
      const summary = runFullRetrievalBenchmark();

      expect(summary.strategies).toBeDefined();
      const { DATABASE_KEYWORD_ONLY, ELASTIC_BM25_ONLY, JINA_SEMANTIC_ONLY, COMBINED_HYBRID } =
        summary.strategies;

      // In pure keyword/BM25 without DB validation, ineligible candidates (unapproved/junior) can leak into results
      expect(ELASTIC_BM25_ONLY.ineligibleRejectionRate).toBeLessThan(1.0);

      // In pure vector search without DB validation, unapproved experts or low-level accounts can rank high
      expect(JINA_SEMANTIC_ONLY.ineligibleRejectionRate).toBeLessThan(1.0);

      // Combined Hybrid fuses dense vector & keyword signals AND enforces 100% DB authoritative checks
      expect(COMBINED_HYBRID.meanReciprocalRank).toBe(1.0);
      expect(COMBINED_HYBRID.averagePrecisionAt1).toBe(1.0);
      expect(COMBINED_HYBRID.averageRecallAt3).toBe(1.0);
      expect(COMBINED_HYBRID.ineligibleRejectionRate).toBe(1.0);

      // Verify each task specifically in Combined Hybrid
      const solanaTask = BENCHMARK_TASKS.find((t) => t.id === "bench_task_solana_cpi")!;
      const hybridSolanaRes = runCombinedHybrid(solanaTask, BENCHMARK_SPECIALISTS);
      expect(hybridSolanaRes.topSpecialistId).toBe("spec_solana_rust");
      expect(hybridSolanaRes.rankedSpecialistIds).not.toContain("spec_rust_junior"); // Excluded: L1 < minimum L2
      expect(hybridSolanaRes.rankedSpecialistIds).not.toContain("spec_unapproved_security"); // Excluded: unapproved

      const pgTask = BENCHMARK_TASKS.find((t) => t.id === "bench_task_postgres_mvcc")!;
      const hybridPgRes = runCombinedHybrid(pgTask, BENCHMARK_SPECIALISTS);
      expect(hybridPgRes.topSpecialistId).toBe("spec_postgres_perf");

      const tsTask = BENCHMARK_TASKS.find((t) => t.id === "bench_task_ts_concurrency")!;
      const hybridTsRes = runCombinedHybrid(tsTask, BENCHMARK_SPECIALISTS);
      expect(hybridTsRes.topSpecialistId).toBe("spec_ts_distributed");
    });
  });

  describe("Jina AI Provider Task Types & In-Memory Deduplication Cache", () => {
    it("transmits task: 'retrieval.passage' for documents and 'retrieval.query' for queries with dimensions: 1024", async () => {
      const originalFetch = globalThis.fetch;
      const fetchCalls: Array<{ url: string; body: Record<string, unknown> }> = [];

      globalThis.fetch = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
        const parsed = JSON.parse(init.body as string);
        fetchCalls.push({ url, body: parsed });
        return {
          ok: true,
          json: async () => ({
            model: "jina-embeddings-v3",
            data: [{ embedding: new Array(1024).fill(0.123) }],
          }),
        };
      }) as typeof fetch;

      try {
        // Temporarily configure Jina in environment
        const prevApiKey = process.env.JINA_API_KEY;
        process.env.JINA_API_KEY = "jina_test_secret_key_12345";

        const provider = new JinaHttpEmbeddingProvider();

        // 1. Passage embedding
        const passageRes = await provider.embedText("Specialist Rust security profile", {
          taskType: "retrieval.passage",
        });
        expect(passageRes).not.toBeNull();
        expect(passageRes?.dimensions).toBe(1024);
        expect(fetchCalls[0].body.task).toBe("retrieval.passage");
        expect(fetchCalls[0].body.dimensions).toBe(1024);

        // 2. Query embedding
        const queryRes = await provider.embedText("Fix Anchor CPI signer exploit", {
          taskType: "retrieval.query",
        });
        expect(queryRes).not.toBeNull();
        expect(queryRes?.dimensions).toBe(1024);
        expect(fetchCalls[1].body.task).toBe("retrieval.query");
        expect(fetchCalls[1].body.dimensions).toBe(1024);

        // 3. Repeat call with identical text: MUST be served from in-memory cache without repeat network fetch!
        const cachedRes = await provider.embedText("Specialist Rust security profile", {
          taskType: "retrieval.passage",
        });
        expect(cachedRes).not.toBeNull();
        expect(fetchCalls).toHaveLength(2); // No 3rd network call!
        expect(provider.getCacheStats().size).toBe(2);

        process.env.JINA_API_KEY = prevApiKey ?? "";
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("scrubs credentials, email patterns, and API keys before embedding", async () => {
      const originalFetch = globalThis.fetch;
      let capturedInput = "";

      globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        const parsed = JSON.parse(init.body as string);
        capturedInput = parsed.input[0];
        return {
          ok: true,
          json: async () => ({
            model: "jina-embeddings-v3",
            data: [{ embedding: new Array(1024).fill(0.05) }],
          }),
        };
      }) as typeof fetch;

      try {
        const prevApiKey = process.env.JINA_API_KEY;
        process.env.JINA_API_KEY = "jina_test_key";
        const provider = new JinaHttpEmbeddingProvider();

        await provider.embedText(
          "Auditor user contact elena.secret@example.com with key ttp_agent_secret_key_12345678",
          { taskType: "retrieval.passage" },
        );

        expect(capturedInput).not.toContain("elena.secret@example.com");
        expect(capturedInput).not.toContain("ttp_agent_secret_key_12345678");
        expect(capturedInput).toContain("[REDACTED]");

        process.env.JINA_API_KEY = prevApiKey ?? "";
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe("API Endpoints & Health Visibility", () => {
    it("reports elastic status and degraded mode in /health when unconfigured", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.elastic).toBeDefined();
      expect(res.body.elastic.mode).toBe("DATABASE_FALLBACK");
      expect(res.body.elastic.indexName).toBe(config.elasticIndexSpecialists);
    });

    it("exposes /api/v1/integrations/elastic/health", async () => {
      const res = await request(app).get("/api/v1/integrations/elastic/health");
      expect(res.status).toBe(200);
      expect(res.body.mode).toBe("DATABASE_FALLBACK");
      expect(res.body.indexName).toBe(config.elasticIndexSpecialists);
      expect(typeof res.body.ok).toBe("boolean");
    });

    it("exposes /api/v1/integrations/jina/health", async () => {
      const res = await request(app).get("/api/v1/integrations/jina/health");
      expect(res.status).toBe(200);
      expect(res.body.model).toBe("jina-embeddings-v3");
      expect(res.body.targetDimensions).toBe(1024);
      expect(res.body.supportedTasks).toContain("retrieval.passage");
      expect(res.body.supportedTasks).toContain("retrieval.query");
      expect(res.body.cache).toBeDefined();
    });

    it("permits authenticated users to trigger /api/v1/integrations/elastic/reindex", async () => {
      await seedDemoUsers();
      const reviewer = agent();
      await loginAs(reviewer, "reviewer@demo.trusttopay.dev");

      const res = await reviewer.post("/api/v1/integrations/elastic/reindex");
      expect(res.status).toBe(200);
      expect(res.body.indexName).toBe(config.elasticIndexSpecialists);
      expect(typeof res.body.durationMs).toBe("number");
    });
  });
});
