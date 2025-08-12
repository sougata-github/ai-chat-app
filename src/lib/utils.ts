/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message as DBMessage } from "@/generated/client";
import { toZonedTime, format } from "date-fns-tz";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UIMessage } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isImageFile(fileName: string): boolean {
  if (!fileName) return false;

  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "svg",
    "tiff",
    "ico",
    "avif",
  ];
  const ext = fileName.split(".").pop()?.toLowerCase();

  return ext ? imageExtensions.includes(ext) : false;
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

export function convertToAISDKMessages(
  messages: Array<DBMessage>
): UIMessage[] {
  return messages.map((msg) => {
    const message: UIMessage = {
      id: msg.id,
      role: msg.role === "USER" ? "user" : "assistant",
      parts: msg.parts as UIMessage["parts"],
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
