import { Doc } from "@convex/_generated/dataModel";
import { toZonedTime, format } from "date-fns-tz";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";


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

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

// convert convex messages to ai sdk format
export function convertConvexMessagesToAISDK(messages: Doc<"messages">[]) {
  return messages.map((msg) => ({
    id: msg.id, //uuid
    role: msg.role === "USER" ? ("user" as const) : ("assistant" as const),
    parts: msg.parts,
  }));
}

export function generateChatId(): string {
  return uuidv4();
}

export const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  return process.env.NEXT_PUBLIC_LOCAL_URL || "http://localhost:3000";
};
