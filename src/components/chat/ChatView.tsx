"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { trpc } from "@/trpc/client";
import Messages from "../messages/Messages";
import { toast } from "sonner";

interface Props {
  initialMessages: Message[];
  chatId: string;
}

const ChatView = ({ initialMessages, chatId: initialChatId }: Props) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();

  // extract chatId from URL
  const getChatIdFromUrl = useCallback(() => {
    const match = pathname.match(/\/chat\/(.+)/);
    return match ? match[1] : initialChatId;
  }, [initialChatId, pathname]);

  const [currentChatId, setCurrentChatId] = useState(getChatIdFromUrl());

  // update currentChatId when URL changes
  useEffect(() => {
    const newChatId = getChatIdFromUrl();
    if (newChatId !== currentChatId) {
      setCurrentChatId(newChatId);
    }
  }, [currentChatId, getChatIdFromUrl, pathname]);

  const { input, handleInputChange, handleSubmit, status, setInput, messages } =
    useChat({
      api: "/api/chat",
      id: currentChatId,
      initialMessages:
        pathname === `/chat/${currentChatId}` ? initialMessages : [],
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

  // for back/forward navigation
  useEffect(() => {
    const handlePopstate = () => {
      const newChatId = getChatIdFromUrl();
      setCurrentChatId(newChatId);
      // force navigation to ensure re-render
      router.replace(`/chat/${newChatId}`);
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [getChatIdFromUrl, router]);

  const handleChatSubmit = () => {
    handleSubmit();
    if (messages.length === 0) {
      window.history.replaceState({}, "", `/chat/${currentChatId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col" key={currentChatId}>
      <div className="flex-1 px-4 pb-8 md:pb-12 h-full">
        {messages.length === 0 && pathname !== `/chat/${currentChatId}` ? (
          <div className="flex items-center justify-center h-full">
            <ChatSuggestions setSuggestions={setInput} />
          </div>
        ) : (
          <div className="flex-1 px-4 pt-10 pb-20 overflow-y-auto h-full">
            <Messages messages={messages} status={status} />
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleChatSubmit}
        status={status}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default ChatView;
