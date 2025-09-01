import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

const custom = customProvider({
  languageModels: {
    "gemini-2.5-flash": google("gemini-2.5-flash"),
    "meta-llama/llama-4-scout-17b-16e-instruct": groq(
      "meta-llama/llama-4-scout-17b-16e-instruct"
    ),
    "qwen/qwen3-32b": wrapLanguageModel({
      model: groq("qwen/qwen3-32b"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
  },
});

export const MODEL_REGISTRY = {
  "qwen/qwen3-32b": {
    provider: custom,
    id: "qwen/qwen3-32b",
    name: "Qwen 32b",
    logo: "/qwen-logo.svg",
  },
  "meta-llama/llama-4-scout-17b-16e-instruct": {
    provider: custom,
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4",
    logo: "/meta-logo.svg",
  },
  "gemini-2.5-flash": {
    provider: custom,
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    logo: "/google-logo.svg",
  },
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

export const DEFAULT_MODEL_ID: ModelId = "gemini-2.5-flash";

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
  return config.provider.languageModel(config.id);
}

export function isValidModelId(modelId: string): modelId is ModelId {
  return modelId in MODEL_REGISTRY;
}
