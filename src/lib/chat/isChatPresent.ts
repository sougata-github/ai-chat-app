"use server";

import { db } from "@/db";

export async function isChatPresent(chatId: string) {
  const existingChat = await db.chat
    .findUnique({
      where: {
        id: chatId,
      },
    })
    .then(Boolean);

  return existingChat;
}
