import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export const MODEL_REGISTRY = {
  "qwen/qwen3-32b": {
    provider: groq,
    id: "qwen/qwen3-32b",
    name: "Qwen 3 32b",
    description: "Robust reasoning model",
  },
  // "llama-3.1-8b-instant": {
  //   provider: groq,
  //   id: "llama-3.1-8b-instant",
  //   name: "Llama 3.1 8b",
  //   description: "Fast Meta model",
  // },
  "gemini-2.5-flash": {
    provider: google,
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Best Gemini model",
  },
  "gemini-2.5-flash-lite-preview-06-17": {
    provider: google,
    id: "gemini-2.5-flash-lite-preview-06-17",
    name: "Gemini 2.5 Flash Lite",
    description: "Balanced Gemini model",
  },
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

export const DEFAULT_MODEL_ID: ModelId = "gemini-2.5-flash-lite-preview-06-17";

export function getModelConfig(modelId: ModelId) {
  const config = MODEL_REGISTRY[modelId];
  if (!config) {
    console.warn(`Model ${modelId} not found, falling back to default`);
    return MODEL_REGISTRY[DEFAULT_MODEL_ID];
  }
  return config;
}

export function createModelInstance(modelId: ModelId) {
  const config = getModelConfig(modelId);
  return config.provider(config.id);
}

export function isValidModelId(modelId: string): modelId is ModelId {
  return modelId in MODEL_REGISTRY;
}
