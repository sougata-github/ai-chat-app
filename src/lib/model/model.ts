import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export const MODEL_REGISTRY = {
  "llama3-8b-8192": {
    provider: groq,
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    description: "Fast and efficient model",
  },
  "llama3-70b-8192": {
    provider: groq,
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    description: "More capable, slower model",
  },
  "gemini-2.0-flash": {
    provider: google,
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's latest fast model",
  },
  "gemini-2.5-flash": {
    provider: google,
    id: "gemini-2.5-flash-preview-04-17",
    name: "Gemini 2.5 Flash",
    description: "Google's preview model",
  },
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

export const DEFAULT_MODEL_ID: ModelId = "llama3-8b-8192";

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
