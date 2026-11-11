import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

let clientInstance: GoogleGenAI | null = null;
let clientApiKey = "";

/**
 * Returns a shared singleton GoogleGenAI client configured with config.geminiApiKey.
 * Returns null if GEMINI_API_KEY is not configured.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (!config.geminiConfigured) {
    return null;
  }
  const activeKey = config.geminiApiKey;
  if (!clientInstance || clientApiKey !== activeKey) {
    clientApiKey = activeKey;
    clientInstance = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        timeout: Math.max(config.codeReviewTimeoutMs, 45_000),
        headers: {
          "User-Agent": "trusttopay-gemini-client",
        },
      },
    });
  }
  return clientInstance;
}

/**
 * Returns model-compatible thinking configuration to avoid unnecessary
 * multi-second reasoning overhead during structured JSON classification.
 */
export function buildGeminiThinkingConfig(model: string): Record<string, unknown> | undefined {
  const budget = config.geminiThinkingBudget;
  if (budget < 0) {
    return undefined;
  }
  const normalized = model.trim().toLowerCase();
  if (normalized.includes("3.6")) {
    return { thinkingLevel: "MINIMAL" };
  }
  if (normalized.includes("3.8") || normalized.includes("3.7") || normalized.includes("2.5")) {
    return { thinkingBudget: budget };
  }
  return undefined;
}

/**
 * Resets the cached singleton GoogleGenAI client.
 * Primarily used in test suites when GEMINI_API_KEY changes dynamically.
 */
export function resetGeminiClient(): void {
  clientInstance = null;
  clientApiKey = "";
}
