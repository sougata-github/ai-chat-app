"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ChatContextProps {
  chatId: string;
  messages: UIMessage[];
  setMessages: ReturnType<typeof useChat>["setMessages"];
  status: ReturnType<typeof useChat>["status"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  regenerate: ReturnType<typeof useChat>["regenerate"];
  resumeStream: ReturnType<typeof useChat>["resumeStream"];
  setInitialMessages: (messages: UIMessage[]) => void;
  setChatId: (id: string) => void;
}

const ChatContext = createContext<ChatContextProps | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatId, setChatId] = useState<string>("");
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | []>([]);

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
      prepareSendMessagesRequest: ({
        messages,
        id,
        body,
        trigger,
        messageId,
      }) => {
        if (trigger === "regenerate-message") {
          return {
            body: {
              trigger: "regenerate-message",
              id,
              messageId,
              timezone: userTimeZone,
              ...body,
            },
          };
        }
        return {
          body: {
            message: messages[messages.length - 1],
            id,
            timezone: userTimeZone,
            ...body,
          },
        };
      },
      // onResponse
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        if (!res.ok) {
          toast.error("Failed to get response from AI");
        }
        return res;
      },
    }),
    generateId: () => uuidv4(),
    experimental_throttle: 50,
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
    onError: async (error) => {
      console.error(error.message);
      toast.error("Error generating response");
    },
  });

  useEffect(() => {
    return () => {
      setMessages([]);
      setInitialMessages([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        messages,
        setMessages,
        status,
        regenerate,
        resumeStream,
        sendMessage,
        setChatId,
        setInitialMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used in a ChatProvider");
  return ctx;
};
