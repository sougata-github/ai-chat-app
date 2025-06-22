"use client";

import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { trpc } from "@/trpc/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  chatId: string;
}

const ChatView = ({ chatId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { input, handleInputChange, handleSubmit, status, setInput } = useChat({
    api: "/api/chat",
    id: chatId,
    generateId: () => uuidv4(),
    sendExtraMessageFields: true,
    // onResponse: async (response) => {
    // },
    onFinish: () => {
      setInput("");
      utils.chats.getMany.invalidate();
    },
  });

  useEffect(() => {
    if (status === "submitted") {
      router.replace(`/chat/${chatId}`);
    }
  }, [status, chatId, router]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 px-4 pb-20">
        <div className="flex items-center justify-center h-full">
          <ChatSuggestions />
        </div>
      </div>

      <ChatInput
        chatId={chatId}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default ChatView;
