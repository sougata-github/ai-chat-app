import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

export const MODEL_REGISTRY = {
  "llama3-70b-8192": {
    provider: groq,
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    description: "Faster and more capable model",
  },
  "llama3-8b-8192": {
    provider: groq,
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    description: "Fast and efficient model",
  },
  "gemma2-9b-it": {
    provider: groq,
    id: "gemma2-9b-it",
    name: "Gemma 2",
    description: "All rounder model by Google",
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

// export const reasoningModel = groq("meta-llama/llama-4-scout-17b-16e-instruct") ->  for tool calling

// for tool-calling:
// "meta-llama/llama-4-scout-17b-16e-instruct": {
//   provider: groq,
//   id: "meta-llama/llama-4-scout-17b-16e-instruct",
//   name: "Llama 4",
//   description: "Best for tool calling",
// },

// for reasoning:
// "deepseek-r1-distill-llama-70b": {
//   provider: groq,
//   id: "deepseek-r1-distill-llama-70b",
//   name: "DeepSeek R1 Distill Llama",
//   description: "More robust and better reasoning model",
// },
