import { UTApi, UTFile } from "uploadthing/server";
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
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
      // const { image } = await experimental_generateImage({
      //   model: fireworks.image("accounts/fireworks/models/flux-1-dev-fp8"),
      //   prompt,
      //   aspectRatio: "1:1",
      //   n: 1,
      // });

      // if (!image.base64) {
      //   throw new Error("Generated image is empty or invalid.");
      //       }

      // const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, "");

      const result = await generateText({
        model: google("gemini-2.0-flash-preview-image-generation"),
        providerOptions: {
          google: { responseModalities: ["TEXT", "IMAGE"] },
        },
        prompt: prompt,
      });

      let base64Image = "";

      for (const file of result.files) {
        if (file.mimeType.startsWith("image/")) {
          base64Image = file.base64;
        }
      }

      if (!base64Image) {
        throw new Error("Generated image is empty or invalid.");
      }

      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const uniqueId = uuidv4();

      const file = new UTFile([buffer], "generated-image.png", {
        customId: `ai-generated-image-${uniqueId}`,
        type: "image/png",
      });

      const utapi = new UTApi();
      const uploadedImage = await utapi.uploadFiles([file]);

      if (!uploadedImage || !uploadedImage[0]) {
        throw new Error("Failed to upload image to UploadThing.");
      }

      if (uploadedImage[0]) console.log("Upload complete");

      const imageKey = uploadedImage[0].data?.key;
      const imageUrl = uploadedImage[0].data?.ufsUrl;

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
  description: "Search the live web and return up-to-date information.",
  parameters: z.object({
    query: z.string().min(1).max(400).describe("The search query"),
  }),
  execute: async ({ query }) => {
    console.log("Searching the web...");
    const exa = getExaClient();

    try {
      console.log("Query:", query);

      const { results } = await exa.searchAndContents(query, {
        livecrawl: "always",
        numResults: 2,
        summary: true,
      });

      if (!results || results.length === 0) {
        return [
          {
            title: "No results found",
            url: "",
            content:
              "No recent information was found for this search query. This might be due to the search service being temporarily unavailable or the query being too specific.",
            publishedDate: null,
          },
        ];
      }

      return results.map((result) => ({
        title: result.title || "Untitled",
        url: result.url || "",
        content: result.summary.slice(0, 500) || "No content available.",
        publishedDate: result.publishedDate || null,
      }));
    } catch (err) {
      console.error("Web search error:", err);
      return [
        {
          title: "Search temporarily unavailable",
          url: "",
          content:
            "The web search service is currently experiencing issues. Please try again in a few moments.",
          publishedDate: null,
        },
      ];
    }
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
    defaultModel: "llama-3.3-70b-versatile" as const,
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
