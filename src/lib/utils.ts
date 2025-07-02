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
      .map((block) => (typeof block.text === "string" ? block.text : ""))
      .join("")
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
