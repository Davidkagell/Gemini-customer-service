import { google } from "@ai-sdk/google";
import { wrapLanguageModel, type LanguageModelMiddleware } from "ai";

const GEMINI_FLASH_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
] as const;

type GeminiFlashModelId = (typeof GEMINI_FLASH_MODELS)[number];

const CONNECT_TIMEOUT_MS = 8_000;
const DEFAULT_QUOTA_COOLDOWN_MS = 60_000;

const quotaCooldownUntilMs = new Map<GeminiFlashModelId, number>();

function isLiteModel(modelId: string) {
  return modelId.includes("lite");
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isQuotaError(error: unknown) {
  return /quota|rate.?limit|RESOURCE_EXHAUSTED|\b429\b/i.test(
    errorMessage(error),
  );
}

function parseRetryAfterMs(error: unknown) {
  const match = errorMessage(error).match(/retry in ([\d.]+)\s*s/i);
  if (!match) {
    return DEFAULT_QUOTA_COOLDOWN_MS;
  }

  return Math.ceil(Number(match[1]) * 1000) + 500;
}

function markQuotaCooldown(modelId: GeminiFlashModelId, error: unknown) {
  if (!isQuotaError(error)) {
    return;
  }

  quotaCooldownUntilMs.set(modelId, Date.now() + parseRetryAfterMs(error));
}

function isInQuotaCooldown(modelId: GeminiFlashModelId) {
  const until = quotaCooldownUntilMs.get(modelId);
  if (until == null) {
    return false;
  }

  if (Date.now() >= until) {
    quotaCooldownUntilMs.delete(modelId);
    return false;
  }

  return true;
}

function remainingCooldownMs(modelId: GeminiFlashModelId) {
  const until = quotaCooldownUntilMs.get(modelId);
  if (until == null) {
    return 0;
  }

  return Math.max(0, until - Date.now());
}

function shouldSkipModel(
  modelId: GeminiFlashModelId,
  lastError: unknown,
  failedModelId: GeminiFlashModelId,
) {
  if (isInQuotaCooldown(modelId)) {
    return true;
  }

  return (
    isQuotaError(lastError) &&
    !isLiteModel(failedModelId) &&
    !isLiteModel(modelId)
  );
}

async function withConnectTimeout<T>(
  promise: PromiseLike<T>,
  modelId: GeminiFlashModelId,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              `${modelId}: connect timeout after ${CONNECT_TIMEOUT_MS}ms`,
            ),
          );
        }, CONNECT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function callModel<T>(
  modelId: GeminiFlashModelId,
  call: (model: ReturnType<typeof google>) => PromiseLike<T>,
) {
  return withConnectTimeout(call(google(modelId)), modelId);
}

async function callWithFallbacks<T>(
  fallbackModelIds: readonly GeminiFlashModelId[],
  firstError: unknown,
  failedModelId: GeminiFlashModelId,
  call: (model: ReturnType<typeof google>) => PromiseLike<T>,
): Promise<T> {
  let lastError: unknown = firstError;
  let lastFailedModelId = failedModelId;

  for (const modelId of fallbackModelIds) {
    if (isAbortError(lastError)) {
      throw lastError;
    }

    if (shouldSkipModel(modelId, lastError, lastFailedModelId)) {
      const cooldownMs = remainingCooldownMs(modelId);
      const reason =
        cooldownMs > 0
          ? `quota cooldown ${Math.ceil(cooldownMs / 1000)}s`
          : "same-tier quota";
      console.warn(`[chat] Skipping ${modelId} (${reason}).`);
      continue;
    }

    console.warn(
      `[chat] Gemini request failed (${errorMessage(lastError)}). Falling back to ${modelId}.`,
    );

    try {
      return await callModel(modelId, call);
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      lastError = error;
      lastFailedModelId = modelId;
      markQuotaCooldown(modelId, error);
    }
  }

  throw lastError;
}

async function runPrimaryThenFallback<T>(
  primary: () => PromiseLike<T>,
  call: (model: ReturnType<typeof google>) => PromiseLike<T>,
): Promise<T> {
  let lastError: unknown;
  const failedModelId: GeminiFlashModelId = primaryModelId;

  if (isInQuotaCooldown(primaryModelId)) {
    lastError = new Error(
      `${primaryModelId} is in quota cooldown (${Math.ceil(remainingCooldownMs(primaryModelId) / 1000)}s remaining)`,
    );
    console.warn(`[chat] ${errorMessage(lastError)}. Skipping to fallback.`);
  } else {
    try {
      return await withConnectTimeout(primary(), primaryModelId);
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      lastError = error;
      markQuotaCooldown(primaryModelId, error);
    }
  }

  return callWithFallbacks(fallbackModelIds, lastError, failedModelId, call);
}

function createGeminiFallbackMiddleware(): LanguageModelMiddleware {
  return {
    specificationVersion: "v4",
    async wrapGenerate({ doGenerate, params }) {
      return runPrimaryThenFallback(
        () => doGenerate(),
        (model) => model.doGenerate(params),
      );
    },
    async wrapStream({ doStream, params }) {
      return runPrimaryThenFallback(
        () => doStream(),
        (model) => model.doStream(params),
      );
    },
  };
}

const [primaryModelId, ...fallbackModelIds] = GEMINI_FLASH_MODELS;

export const geminiModel = wrapLanguageModel({
  model: google(primaryModelId),
  middleware: createGeminiFallbackMiddleware(),
});
