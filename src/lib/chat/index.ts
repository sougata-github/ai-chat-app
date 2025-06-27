"use server";

import { db } from "@/db";
// import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function getChatById(chatId: string) {
  try {
    const existingChat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    return existingChat;
  } catch (error) {
    console.log("Failed to fetch existing chat", error);
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  try {
    const messages = await db.message.findMany({
      where: {
        chatId,
      },
    });

    return messages;
  } catch (error) {
    console.log("Failed to fetch messages", error);
    throw error;
  }
}

export async function generateTitleFromUserMessage(message: string) {
  const { text: title } = await generateText({
    model: groq("llama3-70b-8192"),
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
