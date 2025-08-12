"use client";

import { usePathname, useRouter } from "next/navigation";
import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { trpc } from "@/trpc/client";
import Messages from "../messages/Messages";
import { toast } from "sonner";
import type { ModelId } from "@/lib/model/model";
import type { Tool } from "@/lib/tools/tool";
import ScrollToBottom from "./ScrollToBottom";
import { useScrollMessages } from "@/hooks/use-scroll-messages";
import { useEffect, useState } from "react";

interface Props {
  initialMessages: UIMessage[];
  chatId: string;
  selectedModel: ModelId;
  selectedTool: Tool;
  autoResume?: boolean;
}

const ChatView = ({
  initialMessages,
  chatId,
  selectedModel,
  selectedTool,
  autoResume = false,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  const [input, setInput] = useState("");

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    status,
    regenerate,
    messages,
    setMessages,
    resumeStream,
    sendMessage,
  } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: async ({
        messages,
        id,
        body,
        trigger,
        messageId,
      }) => {
        switch (trigger) {
          case "regenerate-message":
            return {
              body: {
                trigger: "regenerate-message",
                id,
                messageId,
                timezone: userTimeZone,
                ...body,
              },
            };
          case "submit-message":
            return {
              body: {
                trigger: "submit-message",
                message: messages[messages.length - 1],
                id,
                timezone: userTimeZone,
                ...body,
              },
            };
        }
      },
      // onResponse
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        if (!res.ok) {
          toast.error("Failed to get response from AI");
        } else {
          utils.chats.getMany.invalidate();
          utils.chats.getOne.invalidate({ chatId });
        }
        return res;
      },
    }),
    generateId: () => uuidv4(),
    experimental_throttle: 80,
    onData: (dataPart) => {
      if (dataPart.type === "data-appendMessage") {
        try {
          if (typeof dataPart.data === "string") {
            const message = JSON.parse(dataPart.data);

            setMessages((prev) => {
              if (message.id && prev.some((m) => m.id === message.id))
                return prev;
              return [...prev, message];
            });
          }
        } catch (err) {
          console.error("Failed to parse appendMessage:", err);
        }
      }
    },
    onFinish: () => {
      router.refresh();
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId });
    },
    onError: (error) => {
      console.error(error.message);
      toast.error("Error generating response");
    },
  });

  useEffect(() => {
    if (autoResume) {
      resumeStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    chatId,
    messages,
    status,
    isFirstTimeChat,
  });

  const handleInitialSubmit = async () => {
    if (messages.length === 0 && pathname === "/") {
      window.history.pushState(null, "", `/chat/${chatId}`);
    }
  };

  const isHomepageWithNoMessages = messages.length === 0 && pathname === "/";

  return (
    <div className="flex-1 flex flex-col">
      {isHomepageWithNoMessages ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full max-w-3xl">
              <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-4xl font-semibold">
                  How can I help you today?
                </h1>
              </div>

              <ChatInput
                sendMessage={sendMessage}
                initialTool={selectedTool}
                initialModel={selectedModel}
                input={input}
                setInput={setInput}
                handleInitialSubmit={handleInitialSubmit}
                status={status}
                isHomepageCentered={true}
              />
              <ChatSuggestions setSuggestions={setInput} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-auto px-4 pb-20 hide-scrollbar"
            >
              <Messages
                regenerate={regenerate}
                messages={messages}
                status={status}
                lastMessageRef={lastMessageRef}
              />
            </div>
            <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />
          </div>
          <ChatInput
            sendMessage={sendMessage}
            initialTool={selectedTool}
            initialModel={selectedModel}
            input={input}
            setInput={setInput}
            handleInitialSubmit={handleInitialSubmit}
            status={status}
            isHomepageCentered={true}
          />
        </>
      )}
    </div>
  );
};

export default ChatView;
