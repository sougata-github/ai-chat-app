"use client";

import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { trpc } from "@/trpc/client";
import Messages from "../messages/Messages";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  initialMessages: Message[];
  chatId: string;
}

const ChatView = ({ initialMessages, chatId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { input, handleInputChange, handleSubmit, status, setInput, messages } =
    useChat({
      api: "/api/chat",
      id: chatId,
      initialMessages,
      generateId: () => uuidv4(),
      sendExtraMessageFields: true,
      onFinish: () => {
        setInput("");
        utils.chats.getMany.invalidate();
      },
      onError: (error) => {
        console.log(error);
        toast.error("Error generating response");
      },
    });

  useEffect(() => {
    if (initialMessages.length === 0 && status === "streaming") {
      router.push(`/chat/${chatId}`);
    }
  }, [initialMessages.length, chatId, router, status]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 px-4 pb-20">
        {initialMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <ChatSuggestions />
          </div>
        ) : (
          <div className="flex-1 px-4 py-20 overflow-y-auto h-full">
            <Messages messages={messages} status={status} />
          </div>
        )}
      </div>

      <ChatInput
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
