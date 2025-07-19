/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobeIcon, Image, Lightbulb, Zap } from "lucide-react";
import { UTApi, UTFile } from "uploadthing/server";
import { v4 as uuid } from "@lukeed/uuid";
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
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

      const uniqueId = uuid();

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

export const getWeatherTool = tool({
  description: "Get current weather and 5-day forecast for a location",
  parameters: z.object({
    location: z
      .string()
      .min(1)
      .max(100)
      .describe("The location to get weather for"),
  }),
  execute: async ({ location }) => {
    console.log("Fetching weather data...");

    const API_KEY = process.env.WEATHER_API_KEY;

    if (!API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    try {
      // Get current weather and 5-day forecast
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          location
        )}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            error: true,
            message: `Location "${location}" not found. Please check the spelling and try again.`,
            location,
          };
        }
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      const current = data.list[0];

      const dailyForecast = data.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((day: any) => {
          const date = new Date(day.dt * 1000);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          return {
            name: dayName,
            temp: Math.round(day.main.temp),
            condition: day.weather[0].main,
            dayIndex: date.getDay(),
          };
        });

      return {
        location: data.city.name,
        country: data.city.country,
        current: {
          temp: Math.round(current.main.temp),
          condition: current.weather[0].main,
          description: current.weather[0].description,
          humidity: current.main.humidity,
          windSpeed: current.wind.speed,
        },
        forecast: dailyForecast,
        error: false,
      };
    } catch (error) {
      console.error("Weather fetch error:", error);
      return {
        error: true,
        message: "Unable to fetch weather data. Please try again later.",
        location,
      };
    }
  },
});

export type Tool =
  | "none"
  | "image-gen"
  | "web-search"
  | "get-weather"
  | "reasoning";

export const TOOL_REGISTRY = {
  "get-weather": {
    name: "Get weather",
    tool: getWeatherTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: Zap,
  },

  "web-search": {
    name: "Search web",
    tool: webSearchTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: GlobeIcon,
  },
  reasoning: {
    name: "Think longer",
    tool: {},
    defaultModel: "qwen/qwen3-32b" as const,
    icon: Lightbulb,
  },
  "image-gen": {
    name: "Create image",
    tool: generateImageTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: Image,
  },
} as const;

export function isValidTool(tool: string): tool is Tool {
  return (
    tool === "none" ||
    tool === "image-gen" ||
    tool === "web-search" ||
    tool === "get-weather" ||
    tool === "reasoning"
  );
}

export function getTool(tool: Tool) {
  if (tool === "none" || tool === "reasoning") return {};

  const toolConfig = TOOL_REGISTRY[tool];
  if (!toolConfig) return {};

  return { [toolConfig.name]: toolConfig.tool };
}

export function getModelForTool(tool: Tool, fallbackModel: ModelId): ModelId {
  if (tool === "none") return fallbackModel;

  const toolConfig = TOOL_REGISTRY[tool];
  return toolConfig?.defaultModel || fallbackModel;
}
