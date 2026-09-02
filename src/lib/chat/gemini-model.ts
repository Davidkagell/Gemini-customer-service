import { google } from "@ai-sdk/google";
import { wrapLanguageModel, type LanguageModelMiddleware } from "ai";

const GEMINI_FLASH_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
] as const;

type GeminiFlashModelId = (typeof GEMINI_FLASH_MODELS)[number];

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function callWithFallbacks<T>(
  fallbackModelIds: readonly GeminiFlashModelId[],
  firstError: unknown,
  call: (model: ReturnType<typeof google>) => PromiseLike<T>,
): Promise<T> {
  let lastError: unknown = firstError;

  for (const modelId of fallbackModelIds) {
    if (isAbortError(lastError)) {
      throw lastError;
    }

    console.warn(
      `[chat] Gemini request failed (${errorMessage(lastError)}). Falling back to ${modelId}.`,
    );

    try {
      return await call(google(modelId));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function createGeminiFallbackMiddleware(
  fallbackModelIds: readonly GeminiFlashModelId[],
): LanguageModelMiddleware {
  return {
    specificationVersion: "v4",
    async wrapGenerate({ doGenerate, params }) {
      try {
        return await doGenerate();
      } catch (error) {
        if (isAbortError(error) || fallbackModelIds.length === 0) {
          throw error;
        }

        return callWithFallbacks(fallbackModelIds, error, (model) =>
          model.doGenerate(params),
        );
      }
    },
    async wrapStream({ doStream, params }) {
      try {
        return await doStream();
      } catch (error) {
        if (isAbortError(error) || fallbackModelIds.length === 0) {
          throw error;
        }

        return callWithFallbacks(fallbackModelIds, error, (model) =>
          model.doStream(params),
        );
      }
    },
  };
}

const [primaryModelId, ...fallbackModelIds] = GEMINI_FLASH_MODELS;

export const geminiModel = wrapLanguageModel({
  model: google(primaryModelId),
  middleware: createGeminiFallbackMiddleware(fallbackModelIds),
});
