"use server";

import { db } from "@/db";

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
