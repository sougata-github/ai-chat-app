"use client";

import ChatView from "@/components/chat/ChatView";
import { validate as uuidValidate } from "uuid";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useParams, useRouter } from "next/navigation";

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;

  const chat = useQuery(api.chats.getChatByUUID, {
    chatId,
  });
  const user = useQuery(api.auth.getCurrentUser);

  useEffect(() => {
    if (!uuidValidate(chatId)) {
      router.replace("/chat");
      return;
    }
    if (chat && user && chat.userId !== user.userId) {
      router.replace("/chat");
      return;
    }
    if (chat === null) {
      router.replace("/chat");
    }
  }, [chatId, chat, router, user]);

  // Auto-resume if chat exists (undefined means loading, so also enable resume)
  const autoResume = chat !== null;
  const chatStatus = chat?.status;

  return <ChatView chatId={chatId} autoResume={autoResume} chatStatus={chatStatus} />;
}
