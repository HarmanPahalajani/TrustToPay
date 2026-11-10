import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "../config.js";
import { analyzeTask } from "./../services/ai/index.js";
import { setGeminiAnalysisGeneratorForTests } from "./../services/ai/provider.js";
import { AppError } from "../lib/errors.js";
import { runLayeredGeminiSecurityGate } from "../services/security/geminiReviewService.js";
import { resetGeminiClient } from "../lib/gemini.js";

const sampleInput = {
  category: "USB_C_COMPATIBILITY",
  question: "Is the 65W GaN charger compatible with the AeroBook 14 laptop?",
  productModels: ["AeroBook 14 (2024)", "VoltEdge VE-65D"],
  specifications: ["Laptop input: USB-C requires 65W (20V/3.25A) USB PD."],
  documents: [
    {
      title: "VoltEdge VE-65D User Manual",
      sourceType: "MANUFACTURER" as const,
      content: "VoltEdge VE-65D provides 65W max output on USB-C port 1 via USB PD 3.0 (20V/3.25A).",
    },
  ],
};

const validGeminiOutput = {
  summary: "The 65W GaN charger provides sufficient 20V/3.25A power delivery for the AeroBook 14.",
  proposedAnswer: "Yes, the VoltEdge VE-65D is compatible as its single-port output meets the 65W PD requirement.",
  confidenceScore: 0.92,
  uncertainties: [],
  conflictingClaims: [],
  missingInformation: [],
  evidence: [
    {
      title: "VoltEdge VE-65D User Manual",
      url: "https://manufacturer.example.com/manual.pdf",
      publisher: "VoltEdge Official",
      strength: "STRONG",
      supportsAnswer: true,
      excerpt: "VoltEdge VE-65D provides 65W max output on USB-C port 1 via USB PD 3.0 (20V/3.25A).",
    },
  ],
  recommendedAction: "RESOLVE_AUTOMATICALLY",
  escalationReason: "",
  suggestedReviewerSkills: ["Hardware compatibility", "Power Electronics"],
  suggestedReward: {
    amountMinor: 1500,
    currency: "USD",
    rationale: "Standard hardware compatibility verification.",
  },
  reasoningSummary: "Manufacturer documentation explicitly confirms 20V/3.25A USB PD profile matches laptop spec.",
};

describe("Phase 4 Track A — Unified Google Gemini AI Provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    setGeminiAnalysisGeneratorForTests(null);
    resetGeminiClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    setGeminiAnalysisGeneratorForTests(null);
    resetGeminiClient();
  });

  describe("1. Configuration Validation", () => {
    it("reports configured when AI_PROVIDER=gemini and GEMINI_API_KEY is present without OpenAI keys", () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";
      delete process.env.AI_API_KEY;
      delete process.env.AI_BASE_URL;
      delete process.env.AI_MODEL;

      expect(config.aiProvider).toBe("gemini");
      expect(config.geminiConfigured).toBe(true);
      expect(config.aiConfigured).toBe(true);
    });

    it("reports not configured when AI_PROVIDER=gemini and GEMINI_API_KEY is missing", () => {
      process.env.AI_PROVIDER = "gemini";
      delete process.env.GEMINI_API_KEY;

      expect(config.aiProvider).toBe("gemini");
      expect(config.geminiConfigured).toBe(false);
      expect(config.aiConfigured).toBe(false);
    });

    it("preserves OpenAI provider requirements when AI_PROVIDER=openai", () => {
      process.env.AI_PROVIDER = "openai";
      delete process.env.AI_API_KEY;
      process.env.GEMINI_API_KEY = "test-gemini-key";

      expect(config.aiProvider).toBe("openai");
      expect(config.aiConfigured).toBe(false); // requires AI_API_KEY for openai
    });
  });

  describe("2. Gemini Structured Analysis & Mapping", () => {
    it("executes structured Gemini analysis and returns verified output matching analysisOutputSchema", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: JSON.stringify(validGeminiOutput),
      }));

      const result = await analyzeTask(sampleInput);

      expect(result.engine).toBe("provider");
      expect(result.provider).toBe("gemini");
      expect(result.model).toBe(config.geminiModel);
      expect(result.output.proposedAnswer).toContain("VoltEdge VE-65D is compatible");
      expect(result.output.confidenceScore).toBe(0.92);
      expect(result.output.recommendedAction).toBe("RESOLVE_AUTOMATICALLY");
      expect(result.output.evidence).toHaveLength(1);
      expect(result.output.suggestedReward.amountMinor).toBe(1500);
      expect(result.output.suggestedReward.currency).toBe("USD");
    });

    it("correctly handles markdown code fences around Gemini JSON output", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: `\`\`\`json\n${JSON.stringify(validGeminiOutput)}\n\`\`\``,
      }));

      const result = await analyzeTask(sampleInput);
      expect(result.output.confidenceScore).toBe(0.92);
    });
  });

  describe("3. Server-Side Safety Rules & Authoritative Overrides", () => {
    it("overrides RESOLVE_AUTOMATICALLY to ESCALATE_TO_HUMAN when confidence is below threshold", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const lowConfidenceOutput = {
        ...validGeminiOutput,
        confidenceScore: 0.65, // Below default 0.75 threshold
        recommendedAction: "RESOLVE_AUTOMATICALLY",
      };

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: JSON.stringify(lowConfidenceOutput),
      }));

      const result = await analyzeTask(sampleInput);

      // Server rules MUST override model self-assessment
      expect(result.output.recommendedAction).toBe("ESCALATE_TO_HUMAN");
      expect(result.output.escalationReason).toContain("below the escalation threshold");
    });

    it("overrides RESOLVE_AUTOMATICALLY to ESCALATE_TO_HUMAN on CRITICAL conflicts", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const conflictOutput = {
        ...validGeminiOutput,
        confidenceScore: 0.95,
        recommendedAction: "RESOLVE_AUTOMATICALLY",
        conflictingClaims: [
          {
            claimA: "Outputs 65W PD",
            sourceA: "User Manual",
            claimB: "Caps at 45W when multi-port",
            sourceB: "Spec Sheet",
            severity: "CRITICAL",
            detail: "Multi-port drop leaves laptop underpowered.",
          },
        ],
      };

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: JSON.stringify(conflictOutput),
      }));

      const result = await analyzeTask(sampleInput);

      expect(result.output.recommendedAction).toBe("ESCALATE_TO_HUMAN");
      expect(result.output.escalationReason).toMatch(/critical.*conflict/i);
    });

    it("clamps suggestedReward within server-configured reward bounds", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const outOfBoundsOutput = {
        ...validGeminiOutput,
        suggestedReward: {
          amountMinor: 50, // Below REWARD_MIN_MINOR (500)
          currency: "USD",
          rationale: "Too small",
        },
      };

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: JSON.stringify(outOfBoundsOutput),
      }));

      const result = await analyzeTask(sampleInput);
      expect(result.output.suggestedReward.amountMinor).toBe(config.rewardMinMinor);
    });
  });

  describe("4. Critical Failure Handling & No Silent Demo Fallback", () => {
    it("throws AppError(503) without falling back to demo when GEMINI_API_KEY is missing", async () => {
      process.env.AI_PROVIDER = "gemini";
      delete process.env.GEMINI_API_KEY;
      setGeminiAnalysisGeneratorForTests(null);

      await expect(analyzeTask(sampleInput)).rejects.toThrowError(AppError);
      await expect(analyzeTask(sampleInput)).rejects.toMatchObject({
        status: 503,
        code: "GEMINI_NOT_CONFIGURED",
      });
    });

    it("throws AppError(429) on Gemini rate limiting without silent fallback", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => {
        throw new Error("429 Resource has been exhausted (check quota or rate limit)");
      });

      await expect(analyzeTask(sampleInput)).rejects.toThrowError(AppError);
      await expect(analyzeTask(sampleInput)).rejects.toMatchObject({
        status: 429,
        code: "AI_PROVIDER_RATE_LIMIT",
      });
    });

    it("throws AppError(504) on timeout without silent fallback", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => {
        const timeoutErr = new Error("Gemini analysis timed out");
        timeoutErr.name = "TimeoutError";
        throw timeoutErr;
      });

      await expect(analyzeTask(sampleInput)).rejects.toThrowError(AppError);
      await expect(analyzeTask(sampleInput)).rejects.toMatchObject({
        status: 504,
        code: "AI_PROVIDER_TIMEOUT",
      });
    });

    it("throws AppError(502) on invalid structured output or schema mismatch", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: JSON.stringify({ incomplete: "data", missingFields: true }),
      }));

      await expect(analyzeTask(sampleInput)).rejects.toThrowError(AppError);
      await expect(analyzeTask(sampleInput)).rejects.toMatchObject({
        status: 502,
        code: "AI_PROVIDER_SCHEMA_MISMATCH",
      });
    });

    it("throws AppError(502) on malformed JSON response", async () => {
      process.env.AI_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "test-gemini-key";

      setGeminiAnalysisGeneratorForTests(async () => ({
        text: "Not JSON at all, just plain text response",
      }));

      await expect(analyzeTask(sampleInput)).rejects.toThrowError(AppError);
      await expect(analyzeTask(sampleInput)).rejects.toMatchObject({
        status: 502,
        code: "AI_PROVIDER_INVALID_JSON",
      });
    });
  });

  describe("5. Isolation & Backward Compatibility", () => {
    it("executes deterministic demoEngine when AI_PROVIDER=demo", async () => {
      process.env.AI_PROVIDER = "demo";
      delete process.env.GEMINI_API_KEY;

      const result = await analyzeTask(sampleInput);

      expect(result.engine).toBe("demo");
      expect(result.provider).toBe("demo");
      expect(result.model).toBeNull();
      expect(result.output.recommendedAction).toBeDefined();
    });

    it("verifies code security review service continues to function with shared Gemini setup", async () => {
      process.env.GEMINI_API_KEY = "test-gemini-key";

      const gateResult = await runLayeredGeminiSecurityGate({
        taskQuestion: "Implement constant time HMAC check",
        acceptanceCriteria: "Use crypto.timingSafeEqual",
        files: [
          {
            path: "src/safe.ts",
            content: "import crypto from 'node:crypto'; export function check() { return true; }",
          },
        ],
        customGenerator: {
          generateContent: async () => ({
            text: JSON.stringify({
              verdict: "PASS",
              riskLevel: "LOW",
              findings: [],
              confidence: 0.98,
              recommendedAction: "Pass security gate",
            }),
          }),
        },
      });

      expect(gateResult.verdict).toBe("PASS");
      expect(gateResult.status).toBe("PASSED");
    });
  });
});
