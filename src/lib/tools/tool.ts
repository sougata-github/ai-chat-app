/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobeIcon, Lightbulb, Zap, ChartLine } from "lucide-react";
import { UTApi, UTFile } from "uploadthing/server";
import { v4 as uuid } from "@lukeed/uuid";
import { google } from "@ai-sdk/google";
import { generateText, generateObject, tool } from "ai";
import { z } from "zod";

import { ModelId } from "../model/model";
import { getExaClient } from "./exa";

export const generateImageTool = tool({
  description: "Generate an image based on a text prompt",
  inputSchema: z.object({
    prompt: z.string().describe("The prompt to generate the image from"),
  }),
  outputSchema: z.object({
    imageUrl: z.string().url(),
    imageKey: z.string(),
    prompt: z.string(),
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
        model: google("gemini-2.5-flash-image"),
        providerOptions: {
          google: { responseModalities: ["TEXT", "IMAGE"] },
        },
        prompt: prompt,
      });

      let base64Image = "";

      for (const file of result.files) {
        if (file.mediaType.startsWith("image/")) {
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
  inputSchema: z.object({
    query: z.string().min(1).max(400).describe("The search query"),
  }),
  outputSchema: z.array(
    z.object({
      title: z.string(),
      url: z.string().url().or(z.literal("")),
      content: z.string(),
      publishedDate: z.string().nullable(),
    })
  ),
  execute: async ({ query }) => {
    console.log("Searching the web...");
    const exa = getExaClient();

    try {
      const { results } = await exa.searchAndContents(query, {
        livecrawl: "fallback",
        numResults: 4,
        summary: true,
        type: "auto",
      });

      if (!results?.length) {
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
        content: result.summary?.slice(0, 500) || "No content available.",
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

const marketResearchInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(400)
    .describe("The market research query or topic to analyze"),
});

const marketResearchOutputSchema = z.object({
  marketTrends: z
    .string()
    .describe("Point-wise summary of market trends (max 4 points)"),
  chartConfigurations: z
    .array(
      z.object({
        type: z
          .enum(["bar", "line"])
          .describe('The type of chart to generate. Either "bar" or "line"'),
        labels: z.array(z.string()).describe("A list of chart labels"),
        data: z.array(z.number()).describe("A list of the chart data"),
        label: z.string().describe("A label for the chart"),
        colors: z
          .array(z.string())
          .describe(
            'A list of colors to use for the chart, e.g. "rgba(255, 99, 132, 0.8)"'
          ),
      })
    )
    .describe("A list of 1-3 chart configurations for visualization"),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url().or(z.literal("")),
        publishedDate: z.string().nullable(),
      })
    )
    .describe("Array of sources used for the research"),
  error: z.boolean(),
  message: z.string().optional(),
});

export const marketResearchTool = tool<
  z.infer<typeof marketResearchInputSchema>,
  z.infer<typeof marketResearchOutputSchema>
>({
  description:
    "Perform market research with current data and generate visualizations with charts",
  inputSchema: marketResearchInputSchema,
  outputSchema: marketResearchOutputSchema,
  execute: async ({ query }) => {
    console.log("Performing market research...");

    try {
      // Step 1: Search market trends using Google Search
      const { text: marketData, sources: rawSources } = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({} as any) as any,
        },
        prompt: `Search the web for current market trends, data, and insights about: ${query}
        
        Focus on:
        - Market size and growth rates
        - Key players and market share
        - Recent trends and developments
        - Statistical data that can be visualized with charts
        - Important metrics and figures
        
        IMPORTANT: Do NOT include any images, image URLs, or image references in your response. Only provide text-based data and information.
        
        Provide comprehensive, up-to-date information.`,
      });

      if (!marketData) {
        return {
          error: true,
          message: "Unable to fetch market research data. Please try again.",
          marketTrends: "",
          chartConfigurations: [],
          sources: [],
        };
      }

      console.log("Market data retrieved, generating charts...");

      // Step 2: Extract chart data using generateObject
      const { object: chartData } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
          chartConfigurations: z
            .array(
              z.object({
                type: z
                  .enum(["bar", "line"])
                  .describe(
                    'The type of chart to generate. Either "bar" or "line"'
                  ),
                labels: z.array(z.string()).describe("A list of chart labels"),
                data: z.array(z.number()).describe("A list of the chart data"),
                label: z.string().describe("A label for the chart"),
                colors: z
                  .array(z.string())
                  .describe(
                    'A list of colors to use for the chart, e.g. "rgba(255, 99, 132, 0.8)"'
                  ),
              })
            )
            .describe("A list of 1-3 chart configurations"),
        }),
        prompt: `Given the following market research data, create 1-3 meaningful bar or line charts with accurate data for visualization.

Market Data:
${marketData}

Generate charts that best represent the key metrics, comparisons, or trends found in the data.

IMPORTANT: Do NOT include any images, image URLs, or image references. Only provide chart configuration data.`,
      });

      console.log("Charts generated, creating summary...");

      // Step 3: Generate point-wise summary (max 4 points)
      const { text: summary } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Based on the following market research data, create a concise point-wise summary with a MAXIMUM of 4 key points.

Market Data:
${marketData}

Requirements:
- Use bullet points (-)
- Maximum 4 points
- Each point should be concise and informative
- Focus on the most important insights
- Do NOT include any source citations or references in the points
- Do NOT include any images, image URLs, or image references
- Highlight key metrics in bold using **text**

Format your response as a markdown list with bullet points.`,
      });

      // Process sources
      const sources =
        rawSources?.map((source: any) => ({
          title: source.title || "Untitled",
          url: source.url || "",
          publishedDate: source.publishedDate || null,
        })) || [];

      return {
        marketTrends: summary,
        chartConfigurations: chartData.chartConfigurations || [],
        sources: sources.slice(0, 8), // Limit to 8 sources
        error: false,
      };
    } catch (error) {
      console.error("Market research error:", error);
      return {
        error: true,
        message:
          "An error occurred while performing market research. Please try again.",
        marketTrends: "",
        chartConfigurations: [],
        sources: [],
      };
    }
  },
});

const weatherInputSchema = z.object({
  location: z
    .string()
    .min(1)
    .max(100)
    .describe("The location to get weather for"),
});

const weatherOutputSchema = z.object({
  location: z.string(),
  country: z.string(),
  current: z.object({
    temp: z.number(),
    condition: z.string(),
    description: z.string(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
  forecast: z.array(
    z.object({
      name: z.string(),
      temp: z.number(),
      condition: z.string(),
      dayIndex: z.number(),
    })
  ),
  error: z.boolean(),
  message: z.string().optional(),
});

export const getWeatherTool = tool<
  z.infer<typeof weatherInputSchema>,
  z.infer<typeof weatherOutputSchema>
>({
  description: "Get current weather and 5-day forecast for a location",
  inputSchema: weatherInputSchema,
  outputSchema: weatherOutputSchema,
  execute: async ({ location }) => {
    console.log("Fetching weather data...");

    const API_KEY = process.env.WEATHER_API_KEY;

    if (!API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    try {
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
            country: "",
            current: {
              temp: 0,
              condition: "",
              description: "",
              humidity: 0,
              windSpeed: 0,
            },
            forecast: [],
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
        country: "",
        current: {
          temp: 0,
          condition: "",
          description: "",
          humidity: 0,
          windSpeed: 0,
        },
        forecast: [],
      };
    }
  },
});

export type Tool =
  | "none"
  | "web-search"
  | "get-weather"
  | "reasoning"
  | "market-research";

export const TOOL_REGISTRY = {
  "get-weather": {
    name: "Get Weather",
    tool: getWeatherTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: Zap,
  },

  "web-search": {
    name: "Search Web",
    tool: webSearchTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: GlobeIcon,
  },

  reasoning: {
    name: "Think Longer",
    tool: null as any,
    defaultModel: "qwen/qwen3-32b" as const,
    icon: Lightbulb,
  },

  "market-research": {
    name: "Market Research",
    tool: marketResearchTool,
    defaultModel: "gemini-2.5-flash" as const,
    icon: ChartLine,
  },
  // "image-gen": {
  //   name: "Create image",
  //   tool: generateImageTool,
  //   defaultModel: "gemini-2.5-flash" as const,
  //   icon: Image,
  // },
} as const;

export function isValidTool(tool: string): tool is Tool {
  return (
    tool === "none" ||
    tool === "web-search" ||
    tool === "get-weather" ||
    tool === "reasoning" ||
    tool === "market-research"
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
