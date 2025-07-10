"use client";

import { usePathname, useRouter } from "next/navigation";
import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { trpc } from "@/trpc/client";
import Messages from "../messages/Messages";
import { toast } from "sonner";
import { ModelId } from "@/lib/model/model";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { Tool } from "@/lib/tools/tool";
import ScrollToBottom from "./ScrollToBottom";
import { useScrollMessages } from "@/hooks/use-scroll-messages";

interface Props {
  initialMessages: Message[];
  chatId: string;
  selectedModel: ModelId;
  selectedTool: Tool;
}

const ChatView = ({
  initialMessages,
  chatId,
  selectedModel,
  selectedTool,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  const {
    input,
    handleInputChange,
    handleSubmit,
    status,
    setInput,
    messages,
    setMessages,
    data,
    experimental_resume,
  } = useChat({
    key: chatId,
    api: "/api/chat",
    id: chatId,
    initialMessages,
    experimental_prepareRequestBody({ messages, id }) {
      return {
        message: messages[messages.length - 1],
        id,
        model: selectedModel,
        tool: selectedTool,
      };
    },
    generateId: () => uuidv4(),
    sendExtraMessageFields: true,
    experimental_throttle: 50,
    onResponse: (response) => {
      if (!response.ok) {
        toast.error("Failed to get response from AI");
      }
      utils.chats.getMany.invalidate();
    },
    onFinish: () => {
      utils.chats.getOne.invalidate({ chatId });
    },
    onError: (error) => {
      console.error(error.message);
      toast.error("Error generating response");
    },
  });

  useAutoResume({
    autoResume: true,
    initialMessages: initialMessages,
    experimental_resume,
    data,
    setMessages,
  });

  const isInitialLoad = pathname === `/chat/${chatId}`;
  const isFirstTimeChat =
    initialMessages.length === 0 && messages.length <= 2 && pathname === "/";

  const {
    messagesContainerRef,
    lastMessageRef,
    showScrollButton,
    scrollToBottom,
    handleScroll,
  } = useScrollMessages({
    messages,
    status,
    isInitialLoad,
    isFirstTimeChat,
  });

  const handleChatSubmit = () => {
    if (messages.length === 0 && pathname === "/") {
      window.history.replaceState({}, "", `/chat/${chatId}`);
      router.push(`/chat/${chatId}`);
    }
    handleSubmit();
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {messages.length === 0 && pathname === "/" ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ChatSuggestions setSuggestions={setInput} />
          </div>
        ) : (
          <>
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-auto scroll-smooth px-4 pb-20 hide-scrollbar"
            >
              <Messages
                messages={messages}
                status={status}
                lastMessageRef={lastMessageRef}
              />
            </div>
            <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />
          </>
        )}
      </div>

      <ChatInput
        initialTool={selectedTool}
        initialModel={selectedModel}
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
