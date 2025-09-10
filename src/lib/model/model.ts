import { customProvider, extractReasoningMiddleware, wrapLanguageModel, } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { OpenAI, Google, Qwen } from "@lobehub/icons";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";


const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_KEY,
});

const custom = customProvider({
  languageModels: {
    "gemini-2.5-flash": google("gemini-2.5-flash"),
    "openai/gpt-4o-mini": openrouter.chat("openai/gpt-4o-mini"),
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
    logo: Qwen,
  },
  "openai/gpt-4o-mini": {
    provider: custom,
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    logo: OpenAI,
  },
  "gemini-2.5-flash": {
    provider: custom,
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    logo: Google,
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
