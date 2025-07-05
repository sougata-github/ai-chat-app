import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export const MODEL_REGISTRY = {
  "llama-3.3-70b-versatile": {
    provider: groq,
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70b",
    description: "Model optimised for tool calling",
  },
  "meta-llama/llama-4-scout-17b-16e-instruct": {
    provider: groq,
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4",
    description: "Best multimodel model",
  },
  "llama3-70b-8192": {
    provider: groq,
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    description: "Faster and more capable model",
  },
  "gemma2-9b-it": {
    provider: groq,
    id: "gemma2-9b-it",
    name: "Gemma 2",
    description: "All rounder model by Google",
  },
  "gemini-2.5-pro": {
    provider: google,
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Google's smartest model",
  },
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

export const DEFAULT_MODEL_ID: ModelId = "llama3-70b-8192";

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

// export const reasoningModel = groq("meta-llama/llama-4-scout-17b-16e-instruct") ->  for tool calling

// for tool-calling:
// for reasoning:
// "deepseek-r1-distill-llama-70b": {
//   provider: groq,
//   id: "deepseek-r1-distill-llama-70b",
//   name: "DeepSeek R1 Distill Llama",
//   description: "More robust and better reasoning model",
// },

// @cf/black-forest-labs/flux-1-schnell
