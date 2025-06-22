"use client";

import { Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { v4 as uuidv4 } from "uuid";
import Messages from "./Messages";
import ChatInput from "../chat/ChatInput";
import { trpc } from "@/trpc/client";

interface Props {
  chatId: string;
  initialMessages: Message[];
}

const MessagesView = ({ chatId, initialMessages }: Props) => {
  const utils = trpc.useUtils();

  const { messages, input, handleInputChange, handleSubmit, status, setInput } =
    useChat({
      api: "/api/messages",
      initialMessages,
      id: chatId,
      generateId: () => uuidv4(),
      sendExtraMessageFields: true,
      onResponse: () => {
        utils.chats.getMany.invalidate();
      },
      onFinish: () => {
        setInput("");
      },
    });

  return (
    <div className="flex-1 flex flex-col pt-20">
      <div className="flex-1 px-4 pb-20 overflow-y-auto h-full">
        <Messages messages={messages} status={status} />
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

export default MessagesView;
