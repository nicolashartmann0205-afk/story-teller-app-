import { GoogleGenerativeAI } from "@google/generative-ai";

/** True during `next build` / static collection — env vars may be intentionally absent. */
export function isNextProductionBuild(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return true;
  }
  return process.env.npm_lifecycle_event === "build";
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function requireGeminiApiKey(): string {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

const warnedContexts = new Set<string>();

/**
 * Warn once per server process when AI runs without a key.
 * Skipped during `next build` so Vercel build logs stay clean.
 */
export function warnGeminiMissingOnce(context: string): void {
  if (isNextProductionBuild() || isGeminiConfigured()) {
    return;
  }
  if (warnedContexts.has(context)) {
    return;
  }
  warnedContexts.add(context);
  console.warn(`GEMINI_API_KEY is not set. ${context} will fail if called.`);
}

let cachedClient: GoogleGenerativeAI | undefined;

export function getGeminiClient(): GoogleGenerativeAI {
  const key = requireGeminiApiKey();
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(key);
  }
  return cachedClient;
}
