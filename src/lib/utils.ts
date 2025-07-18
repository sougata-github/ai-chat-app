import {
  FileUIPart,
  ReasoningUIPart,
  SourceUIPart,
  StepStartUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from "@ai-sdk/ui-utils";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message as DBMessage } from "@/generated/client";
import { toZonedTime, format } from "date-fns-tz";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message } from "ai";

import { Tool } from "./tools/tool";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function injectCurrentDate(
  prompt: string,
  timezone: string = "Asia/Kolkata"
) {
  const now = new Date();
  const zoned = toZonedTime(now, timezone);

  const formatted = format(zoned, "EEEE, MMMM d, yyyy 'at' h:mm a zzz", {
    timeZone: timezone,
  });

  return prompt.replace("{{CURRENT_DATE}}", `${formatted} (${timezone})`);
}

export function extractText(content: any): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block?.text) return block.text;
        if (block?.code) return `\`\`\`\n${block.code}\n\`\`\``;
        if (block?.url) return `[Link](${block.url})`;
        return "";
      })
      .join("\n\n")
      .trim();
  }

  return "";
}

export function convertToAISDKMessages(messages: Array<DBMessage>): Message[] {
  return messages.map((msg) => {
    const message: Message = {
      id: msg.id,
      role: msg.role === "USER" ? "user" : "assistant",
      parts: msg.parts as Message["parts"],
      content: msg.content || "",
      createdAt: msg.createdAt,
    };
    return message;
  });
}

type PART =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart
  | FileUIPart
  | StepStartUIPart;

export function filterMessageHistory(messages: Message[], activeTool: Tool) {
  if (activeTool === "none") {
    // Remove all tool-related messages when no tools are active
    return messages
      .map((message) => {
        if (message.role === "assistant" && message.parts) {
          const filteredParts = message.parts.filter(
            (part: PART) => part.type !== "tool-invocation"
          );

          return {
            ...message,
            parts: filteredParts,
          };
        }

        return message;
      })
      .filter(
        (message) =>
          (message.parts?.length && message.parts.length > 0) ||
          message.role !== "assistant"
      );
  }

  // For specific tool modes, filter out unrelated tool invocations
  // const allowedTools = getActiveToolNames(activeTool);

  // return messages
  //   .map((message) => {
  //     if (message.role === "assistant" && message.parts) {
  //       const filteredParts = message.parts.filter((part: PART) => {
  //         if (part.type === "tool-invocation") {
  //           return allowedTools.includes(part.toolInvocation?.toolName);
  //         }
  //         return true;
  //       });

  //       return {
  //         ...message,
  //         parts: filteredParts,
  //       };
  //     }

  //     return message;
  //   })
  //   .filter(
  //     (message) =>
  //       (message.parts?.length && message.parts.length > 0) ||
  //       message.role !== "assistant"
  //   );

  return messages;
}

export function getActiveToolNames(tool: Tool): string[] {
  switch (tool) {
    case "image-gen":
      return ["generateImageTool"];
    case "web-search":
      return ["webSearchTool"];
    case "get-weather":
      return ["getWeatherTool"];
    default:
      return [];
  }
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function cleanText(text: string = ""): string {
  return text
    .replace(/\n+/g, " ") // Remove excessive newlines
    .replace(/\s+/g, " ") // Collapse spaces
    .replace(/https?:\/\/\S+/g, "") // Strip URLs
    .trim();
}
