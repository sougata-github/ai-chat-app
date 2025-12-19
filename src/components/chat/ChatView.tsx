"use client";

import { useRouter } from "next/navigation";
import ChatInput from "./ChatInput";
import { DefaultChatTransport, type UIMessage, type CreateUIMessage } from "ai";
import Messages from "../messages/Messages";
import ScrollToBottom from "./ScrollToBottom";
import { useScrollMessages } from "@/hooks/use-scroll-messages";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { convertConvexMessagesToAISDK } from "@/lib/utils";
import { WandSparkles } from "lucide-react";
import { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Props {
  chatId: string;
  autoResume: boolean;
  isNewChat: boolean;
}

const ChatView = ({ chatId, isNewChat, autoResume }: Props) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const createChat = useMutation(api.chats.createChat);
  const updateChatStatus = useMutation(api.chats.updateChatStatus);
  const createMessage = useMutation(api.chats.createMessage);
  const createAttachment = useMutation(api.chats.createAttachment);
  const convexMessages = useQuery(api.chats.getMessagesByChatId, {
    chatId,
  });

  const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [messageToEdit, setMessageToEdit] = useState<Doc<"messages"> | null>(
    null
  );
  const [handleRegenerate, setHandleRegenerate] = useState<
    (() => Promise<void>) | undefined
  >(undefined);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert Convex messages to AI SDK format for initial state
  const initialMessages = useMemo(() => {
    if (!convexMessages) return [];
    return convertConvexMessagesToAISDK(convexMessages);
  }, [convexMessages]);

  // Transport configuration with resume support
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
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
        // Resume endpoint configuration
        prepareReconnectToStreamRequest: ({ id }) => ({
          api: `/api/chat/${id}/stream`,
        }),
        fetch: async (input, init) => {
          const res = await fetch(input, init);
          if (!res.ok) {
            toast.error("Failed to get response from AI");
          }
          return res;
        },
      }),
    [userTimeZone]
  );

  const {
    messages,
    status,
    regenerate,
    setMessages,
    sendMessage: sendChatMessage,
  } = useChat({
    id: chatId,
    messages: initialMessages,
    resume: autoResume,
    transport,
    generateId: () => uuidv4(),
    experimental_throttle: 50,
    onData: (dataPart) => {
      if (dataPart.type === "data-appendMessage") {
        try {
          if (typeof dataPart.data === "string") {
            const message = JSON.parse(dataPart.data);
            setMessages((prev) => {
              if (
                message.id &&
                prev.some((m: UIMessage) => m.id === message.id)
              )
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

  // Sync Convex messages to useChat when they load (for page refresh)
  useEffect(() => {
    if (convexMessages && convexMessages.length > 0) {
      const aiMessages = convertConvexMessagesToAISDK(convexMessages);
      setMessages(aiMessages);
    }
  }, [convexMessages, setMessages]);

  const {
    endRef,
    messagesContainerRef,
    showScrollButton,
    scrollToBottom,
    hasSentMessage,
  } = useScrollMessages({
    chatId,
    messages,
    status,
    isNewChat,
  });

  const handleCreateUserMessage = async (
    message: UIMessage,
    fileKey: string | undefined
  ) => {
    let attachmentId: string | undefined = undefined;

    if (fileKey !== undefined) {
      const fileAttachment = (message as UIMessage).parts?.find(
        (part) => part.type === "file"
      );

      if (
        fileAttachment &&
        fileAttachment.filename &&
        fileAttachment.url &&
        fileAttachment.type
      ) {
        const attachment = await createAttachment({
          id: uuidv4(),
          messageId: message.id,
          name: fileAttachment.filename,
          type: fileAttachment.mediaType,
          url: fileAttachment.url,
          key: fileKey,
          chatId,
        });
        attachmentId = attachment.uuid;
      }
    }

    await createMessage({
      id: message.id,
      chatId,
      parts: message.parts,
      imageKey: undefined,
      imageUrl: undefined,
      role: "USER",
      attachmentId,
      fileKey,
    });
  };

  const handleInitialSubmit = async () => {
    await createChat({
      id: chatId,
      title: "New Chat",
    });

    router.replace(`/chat/${chatId}`);
  };

  const handleUpdateChat = async () => {
    await updateChatStatus({ chatId, status: "streaming" });
  };

  // Wrapper to match ChatInput's expected sendMessage type
  const sendMessage = (message: CreateUIMessage<UIMessage> | string) => {
    sendChatMessage(message as Parameters<typeof sendChatMessage>[0]);
  };

  const visibleMessages = messages.filter((m) => !hiddenMessageIds.has(m.id));

  return (
    <div className="flex-1 flex flex-col">
      {isNewChat ? (
        <>
          <div className="sm:flex flex-1 flex-col items-center justify-center px-4 hidden">
            <div className="w-full max-w-3xl">
              <div className="mb-5 text-center">
                <h1 className="text-5xl font-semibold inline-flex items-center gap-2">
                  <WandSparkles className="size-8" /> Get Started
                </h1>
              </div>

              <ChatInput
                chatId={chatId}
                messageToEdit={messageToEdit}
                setMessageToEdit={setMessageToEdit}
                handleRegenerate={handleRegenerate}
                updateChat={handleUpdateChat}
                createUserMessage={handleCreateUserMessage}
                sendMessage={sendMessage}
                input={input}
                setInput={setInput}
                handleInitialSubmit={handleInitialSubmit}
                status={status}
                isHomepageCentered={true}
                isNewChat={true}
              />
              {/* <ChatSuggestions setSuggestions={setInput} /> */}
            </div>
          </div>

          {/* for mobile */}
          <div className="flex flex-1 flex-col justify-center px-4 sm:hidden">
            <div className="w-full max-w-3xl mx-auto text-center">
              <div className="mb-5">
                <h1 className="text-3xl font-semibold inline-flex items-center gap-2">
                  <WandSparkles className="size-6" /> Get Started
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a new chat with a prompt or upload a file.
                </p>
              </div>
              {/* <ChatSuggestions setSuggestions={setInput} /> */}
            </div>
          </div>
          <ChatInput
            chatId={chatId}
            messageToEdit={messageToEdit}
            setMessageToEdit={setMessageToEdit}
            handleRegenerate={handleRegenerate}
            updateChat={handleUpdateChat}
            createUserMessage={handleCreateUserMessage}
            sendMessage={sendMessage}
            input={input}
            setInput={setInput}
            handleInitialSubmit={handleInitialSubmit}
            status={status}
            isHomepageCentered={false}
            isNewChat={false}
          />
        </>
      ) : (
        <>
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={messagesContainerRef}
              className="absolute inset-0 overflow-y-auto px-2 sm:px-4 pb-4 hide-scrollbar"
            >
              <Messages
                updateChat={handleUpdateChat}
                setMessageToEdit={setMessageToEdit}
                setHandleRegenerate={setHandleRegenerate}
                setHiddenMessageIds={setHiddenMessageIds}
                chatId={chatId}
                regenerate={regenerate}
                messages={visibleMessages}
                status={status}
              />
              <motion.div
                ref={endRef}
                style={{
                  height: hasSentMessage ? "20rem" : "0",
                  transition: "height",
                }}
              />
            </div>
            <ScrollToBottom
              show={showScrollButton}
              onClick={() => scrollToBottom("auto")}
            />
          </div>
          <ChatInput
            chatId={chatId}
            messageToEdit={messageToEdit}
            setMessageToEdit={setMessageToEdit}
            handleRegenerate={handleRegenerate}
            updateChat={handleUpdateChat}
            sendMessage={sendMessage}
            createUserMessage={handleCreateUserMessage}
            input={input}
            setInput={setInput}
            status={status}
            isHomepageCentered={true}
            isNewChat={false}
          />
        </>
      )}
    </div>
  );
};

export default ChatView;
