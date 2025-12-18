import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { Google, Qwen, Moonshot } from "@lobehub/icons";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

const custom = customProvider({
  languageModels: {
    "gemini-2.5-flash": google("gemini-2.5-flash"),
    "moonshotai/kimi-k2-instruct-0905": groq(
      "moonshotai/kimi-k2-instruct-0905"
    ),
    // "gemini-3.0-flash": google("gemini-3-flash-preview"),
    "qwen/qwen3-32b": wrapLanguageModel({
      model: groq("qwen/qwen3-32b"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    // "xai/grok-code-fast-1": gateway("xai/grok-code-fast-1"),
    // "anthropic/claude-sonnet-4.5": gateway("anthropic/claude-sonnet-4.5"),
    // "anthropic/claude-haiku-4.5": gateway("anthropic/claude-haiku-4.5"),
    // "openai/gpt-5-codex": gateway("openai/gpt-5-codex"),
    // "deepseek/deepseek-v3.2": gateway("deepseek/deepseek-v3.2"),
    // "openai/gpt-5-mini": gateway("openai/gpt-5-mini"),
  },
});

export const MODEL_REGISTRY = {
  "qwen/qwen3-32b": {
    provider: custom,
    id: "qwen/qwen3-32b",
    name: "Qwen 32b",
    logo: Qwen,
  },
  // "gemini-3.0-flash": {
  //   provider: custom,
  //   id: "gemini-3.0-flash",
  //   name: "Gemini 3.0 Flash",
  //   logo: Google,
  // },
  "moonshotai/kimi-k2-instruct-0905": {
    provider: custom,
    id: "moonshotai/kimi-k2-instruct-0905",
    name: "Kimi K2",
    logo: Moonshot,
  },
  "gemini-2.5-flash": {
    provider: custom,
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    logo: Google,
  },
  // "xai/grok-code-fast-1": {
  //   provider: custom,
  //   id: "xai/grok-code-fast-1",
  //   name: "Grok Code Fast",
  //   logo: XAI,
  // },
  // "anthropic/claude-sonnet-4.5": {
  //   provider: custom,
  //   id: "anthropic/claude-sonnet-4.5",
  //   name: "Claude Sonnet 4.5",
  //   logo: Anthropic,
  // },
  // "anthropic/claude-haiku-4.5": {
  //   provider: custom,
  //   id: "anthropic/claude-haiku-4.5",
  //   name: "Claude Haiku 4.5",
  //   logo: Anthropic,
  // },
  // "openai/gpt-5-codex": {
  //   provider: custom,
  //   id: "openai/gpt-5-codex",
  //   name: "GPT-5 Codex",
  //   logo: OpenAI,
  // },
  // "deepseek/deepseek-v3.2": {
  //   provider: custom,
  //   id: "deepseek/deepseek-v3.2",
  //   name: "DeepSeek V3.2",
  //   logo: DeepSeek,
  // },
  // "openai/gpt-5-mini": {
  //   provider: custom,
  //   id: "openai/gpt-5-mini",
  //   name: "GPT-5 Mini",
  //   logo: OpenAI,
  // },
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
