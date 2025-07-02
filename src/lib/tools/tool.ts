import { experimental_generateImage, tool } from "ai";
import { UTApi, UTFile } from "uploadthing/server";
import { fireworks } from "@ai-sdk/fireworks";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { ModelId } from "../model/model";
import { getExaClient } from "./exa";

export const generateImageTool = tool({
  description: "Generate an image based on a text prompt",
  parameters: z.object({
    prompt: z.string().describe("The prompt to generate the image from"),
  }),
  execute: async ({ prompt }) => {
    try {
      const { image } = await experimental_generateImage({
        model: fireworks.image("accounts/fireworks/models/flux-1-dev-fp8"),
        prompt,
        aspectRatio: "1:1",
        n: 1,
      });

      if (!image.base64) {
        throw new Error("Generated image is empty or invalid.");
      }

      // console.log("Image successfully generated");

      // Convert base64 to buffer
      const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // console.log("Uploadthing to uploadthing...");

      const uniqueId = uuidv4();

      const file = new UTFile([buffer], "generated-image.png", {
        customId: `ai-generated-image-${uniqueId}`,
        type: "image/png",
      });

      // console.log("Uploading to UploadThing...");

      const utapi = new UTApi();
      const uploadedImage = await utapi.uploadFiles([file]);

      if (!uploadedImage || !uploadedImage[0]) {
        throw new Error("Failed to upload image to UploadThing.");
      }

      if (uploadedImage[0]) console.log("Upload complete");

      const imageKey = uploadedImage[0].data?.key;
      const imageUrl = uploadedImage[0].data?.ufsUrl;

      // console.log(imageUrl);

      return {
        imageUrl,
        imageKey,
        prompt,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error("Failed to generate image");
    }
  },
});

export const webSearchTool = tool({
  description: "Search the web for up-to-date information",
  parameters: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }) => {
    console.log("Searching the web...");

    const exa = getExaClient();

    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 2,
    });
    return results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000),
      publishedDate: result.publishedDate,
    }));
  },
});

export type ToolMode = "text" | "image-gen" | "web-search";

export const TOOL_REGISTRY = {
  "image-gen": {
    name: "generateImageTool",
    tool: generateImageTool,
    defaultModel: "meta-llama/llama-4-scout-17b-16e-instruct" as const,
    icon: "image",
  },
  "web-search": {
    name: "webSearchTool",
    tool: webSearchTool,
    defaultModel: "meta-llama/llama-4-scout-17b-16e-instruct" as const,
    icon: "globe",
  },
} as const;

export function isValidToolMode(mode: string): mode is ToolMode {
  return mode === "text" || mode === "image-gen" || mode === "web-search";
}

export function getToolsForMode(mode: ToolMode) {
  if (mode === "text") return {};

  const toolConfig = TOOL_REGISTRY[mode];
  if (!toolConfig) return {};

  return { [toolConfig.name]: toolConfig.tool };
}

export function getModelForMode(
  mode: ToolMode,
  fallbackModel: ModelId
): ModelId {
  if (mode === "text") return fallbackModel;

  const toolConfig = TOOL_REGISTRY[mode];
  return toolConfig?.defaultModel || fallbackModel;
}
