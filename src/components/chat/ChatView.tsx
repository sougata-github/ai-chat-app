"use client";

import { usePathname, useRouter } from "next/navigation";
import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";
import { trpc } from "@/trpc/client";
import Messages from "../messages/Messages";
import { toast } from "sonner";
import type { ModelId } from "@/lib/model/model";
import { useAutoResume } from "@/hooks/use-auto-resume";
import type { Tool } from "@/lib/tools/tool";
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

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
        timezone: userTimeZone,
      };
    },
    generateId: () => uuidv4(),
    sendExtraMessageFields: true,
    experimental_throttle: 25,
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
    initialMessages.length === 0 &&
    messages.length <= 2 &&
    pathname.startsWith("/chat");

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
    handleSubmit();
    if (messages.length === 0 && pathname === "/") {
      window.history.replaceState({}, "", `/chat/${chatId}`);
      router.push(`/chat/${chatId}`);
    }
  };

  const isHomepageWithNoMessages = messages.length === 0 && pathname === "/";

  return (
    <div className="flex-1 flex flex-col">
      {isHomepageWithNoMessages ? (
        <>
          <div className="hidden sm:flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full max-w-3xl">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-semibold">
                  How can I help you today?
                </h1>
              </div>

              <ChatInput
                initialTool={selectedTool}
                initialModel={selectedModel}
                input={input}
                setInput={setInput}
                handleSubmit={handleChatSubmit}
                status={status}
                handleInputChange={handleInputChange}
                isHomepageCentered={true}
              />
              <ChatSuggestions setSuggestions={setInput} />
            </div>
          </div>

          <div className="sm:hidden flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-semibold">
                  How can I help you today?
                </h1>
              </div>
              <ChatSuggestions setSuggestions={setInput} />
            </div>
            <ChatInput
              initialTool={selectedTool}
              initialModel={selectedModel}
              input={input}
              setInput={setInput}
              handleSubmit={handleChatSubmit}
              status={status}
              handleInputChange={handleInputChange}
              isHomepageCentered={false}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-hidden relative">
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
          </div>
          <ChatInput
            initialTool={selectedTool}
            initialModel={selectedModel}
            input={input}
            setInput={setInput}
            handleSubmit={handleChatSubmit}
            status={status}
            handleInputChange={handleInputChange}
            isHomepageCentered={false}
          />
        </>
      )}
    </div>
  );
};

export default ChatView;
