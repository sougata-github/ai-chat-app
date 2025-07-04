/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message as DBMessage } from "@/generated/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
