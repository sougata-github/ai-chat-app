"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateTitleFromUserMessage(message: string) {
  const { text: title } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt: message,
    system: `
You are a helpful assistant that summarizes the user's first message into a short, clear title.

Guidelines:
- The title should summarize the message's intent or topic.
- Limit to 4 words or fewer.
- Keep it under 50 characters.
- Do not use quotation marks, colons, or the word "title".
- Return only the title text, nothing else.
    `,
  });

  return title.trim();
}
