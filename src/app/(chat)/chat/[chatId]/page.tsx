"use client";

import ChatView from "@/components/chat/ChatView";
import { validate as uuidValidate } from "uuid";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = params.chatId as string;
  const chat = useQuery(api.chats.getChatByUUID, {
    chatId,
  });

  const skipResume = searchParams.get("skipResume") === "1";

  useEffect(() => {
    if (!uuidValidate(params.chatId as string)) {
      router.replace("/");
      return;
    }
    if (chat === null) {
      router.replace("/");
    }
  }, [params, chat, router]);

  return (
    <ChatView
      chatId={params.chatId as string}
      isNewChat={false}
      autoResume={!skipResume}
    />
  );
}
