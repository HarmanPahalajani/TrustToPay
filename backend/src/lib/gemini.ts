import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

let clientInstance: GoogleGenAI | null = null;

/**
 * Returns a shared singleton GoogleGenAI client configured with config.geminiApiKey.
 * Returns null if GEMINI_API_KEY is not configured.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (!config.geminiConfigured) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "trusttopay-gemini-client",
        },
      },
    });
  }
  return clientInstance;
}

/**
 * Resets the cached singleton GoogleGenAI client.
 * Primarily used in test suites when GEMINI_API_KEY changes dynamically.
 */
export function resetGeminiClient(): void {
  clientInstance = null;
}
