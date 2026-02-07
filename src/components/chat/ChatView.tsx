"use client";

import { useRouter, usePathname } from "next/navigation";
import ChatInput from "./ChatInput";
import { DefaultChatTransport, type UIMessage, type CreateUIMessage } from "ai";
import Messages from "../messages/Messages";
import ScrollToBottom from "./ScrollToBottom";
import { useScrollMessages } from "@/hooks/use-scroll-messages";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useMemo, useState, useRef } from "react";
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
  chatStatus?: string; // "streaming" | "ready" | undefined
}

const ChatView = ({ chatId, autoResume, chatStatus }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const createChat = useMutation(api.chats.createChat);
  const updateChatStatus = useMutation(api.chats.updateChatStatus);
  const createMessage = useMutation(api.chats.createMessage);
  const createAttachment = useMutation(api.chats.createAttachment);
  const convexMessages = useQuery(api.chats.getMessagesByChatId, {
    chatId,
  });

  // Handle browser back/forward navigation (popstate event)
  // This ensures component state stays in sync when user uses browser navigation
  useEffect(() => {
    const handlePopState = () => {
      // When user navigates back/forward, refresh to sync with the URL
      // This ensures messages and state are correct when using browser navigation
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

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

  // Track if we should enable resume - only if:
  // 1. Chat status is "streaming" (indicates an active stream)
  // 2. Messages are loaded (prevents blank screen)
  // This ensures we only try to resume when there's actually an active stream,
  // not on every navigation to an existing chat
  const shouldResume =
    autoResume && chatStatus === "streaming" && convexMessages !== undefined;

  const {
    messages,
    status,
    regenerate,
    setMessages,
    sendMessage: sendChatMessage,
  } = useChat({
    id: chatId,
    messages: initialMessages,
    resume: shouldResume,
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
      console.error("Chat error:", error);
      // Provide more specific error messages
      const errorMessage = error.message || String(error);
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("aborted")
      ) {
        toast.error(
          "Response timed out. The response may be too long. Please try again."
        );
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (errorMessage.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else {
        toast.error(`Error generating response: ${errorMessage}`);
      }
    },
  });

  // Track previous chatId to detect navigation
  const prevChatIdRef = useRef(chatId);

  // Sync Convex messages to useChat ONLY when they load asynchronously
  // This is needed because:
  // 1. When chatId changes, useChat resets and uses initialMessages (which might be empty initially)
  // 2. When convexMessages loads later, we need to sync them
  //
  // Performance: Uses already-computed initialMessages (no double conversion)
  // Only syncs once per chatId when messages first load
  useEffect(() => {
    const chatIdChanged = prevChatIdRef.current !== chatId;

    if (chatIdChanged) {
      prevChatIdRef.current = chatId;
      // When chatId changes, useChat resets - clear messages immediately
      // Determine if new chat based on whether messages exist
      const isNewChatState =
        convexMessages === undefined || convexMessages.length === 0;

      if (isNewChatState) {
        setMessages([]);
      } else {
        // For existing chats, clear messages if they're still loading
        // This prevents showing stale messages from the previous chat during navigation
        if (convexMessages === undefined) {
          setMessages([]);
        }
      }
      // The initialMessages will be used by useChat for existing chats once loaded
      return;
    }

    // Only sync if messages loaded asynchronously (after mount or navigation)
    // This handles: page refresh, mid-stream refresh, or slow message loading
    // Important: Sync even if messages are empty to clear stale data from previous chat
    if (convexMessages !== undefined) {
      // Always sync when messages are loaded to ensure we have the correct state
      // This is especially important when navigating between chats during streaming
      setMessages((current) => {
        // Only update if messages are different
        if (current.length !== initialMessages.length) {
          return initialMessages;
        }
        // Check if any message IDs differ
        const currentIds = current.map((m) => m.id).join(",");
        const newIds = initialMessages.map((m) => m.id).join(",");
        return currentIds !== newIds ? initialMessages : current;
      });
    }
  }, [convexMessages, initialMessages, chatId, setMessages]);

  // Determine if this is a new chat based on actual state
  // Since we use window.history.replaceState, the component doesn't remount
  // So we need to compute isNewChat based on messages length instead of props
  // Important: If we're on /chat/[chatId] route, it's an existing chat (even if loading)
  // Only show new chat UI if we're on homepage (/) AND messages are empty
  const isOnChatRoute = pathname.startsWith("/chat/") && pathname !== "/chat";

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
    isNewChat: !isOnChatRoute,
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

    // Update URL without navigation to preserve component state
    // Using window.history.replaceState to avoid remounting the component
    // This preserves the useChat hook state and prevents stream interruption
    const newUrl = `/chat/${chatId}`;
    window.history.replaceState({}, "", newUrl);
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
      {!isOnChatRoute ? (
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
                setMessages={setMessages as typeof setMessages}
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
            setMessages={setMessages}
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
              onClick={() => scrollToBottom("smooth")}
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
            setMessages={setMessages}
          />
        </>
      )}
    </div>
  );
};

export default ChatView;
