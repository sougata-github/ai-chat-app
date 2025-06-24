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
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 50 characters long
    - avoid the word "title"
    - do not use quotes
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
  });

  return title;
}
