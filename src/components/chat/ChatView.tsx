"use client";

import { useRouter } from "next/navigation";
import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";
import { type UIMessage } from "ai";
import Messages from "../messages/Messages";
import ScrollToBottom from "./ScrollToBottom";
import { useScrollMessages } from "@/hooks/use-scroll-messages";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { useChatContext } from "../providers/ChatProvider";
import { convertConvexMessagesToAISDK } from "@/lib/utils";
import { WandSparkles } from "lucide-react";
import { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { motion } from "framer-motion";

interface Props {
  chatId: string;
  autoResume: boolean;
  isNewChat: boolean;
}

const ChatView = ({ chatId, isNewChat }: Props) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const createChat = useMutation(api.chats.createChat);
  const updateChat = useMutation(api.chats.updateChatStatus);
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

  const {
    messages,
    status,
    regenerate,
    setMessages,
    setInitialMessages,
    sendMessage,
    setChatId,
  } = useChatContext();

  useEffect(() => {
    setChatId(chatId);
    if (convexMessages) {
      const aiMessages = convertConvexMessagesToAISDK(convexMessages);
      setMessages(aiMessages);
      setInitialMessages(aiMessages);
    }
  }, [setChatId, chatId, setMessages, setInitialMessages, convexMessages]);

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

  const handleInitialSubmit = () => {
    void createChat({
      id: chatId,
      title: "New Chat",
    });
    router.replace(`/chat/${chatId}?skipResume=1`);
  };

  const handleUpdateChat = async () => {
    await updateChat({ chatId, status: "streaming" });
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
