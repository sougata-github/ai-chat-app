"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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

interface Props {
  initialMessages: Message[];
  chatId: string;
  selectedModel: ModelId;
  selectedTool: Tool;
}

const ChatView = ({
  initialMessages,
  chatId: fallbackChatId,
  selectedModel,
  selectedTool,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  const chatId = pathname.startsWith("/chat/")
    ? pathname.replace("/chat/", "")
    : fallbackChatId;

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
    body: {
      model: selectedModel,
      tool: selectedTool,
    },
    initialMessages: pathname === `/chat/${chatId}` ? initialMessages : [],
    generateId: () => uuidv4(),
    sendExtraMessageFields: true,
    experimental_throttle: 50,
    onResponse: (response) => {
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId });
      if (!response.ok) {
        toast.error("Failed to get response from AI");
      }
    },
    onFinish: () => {
      setInput("");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId });

      router.refresh();
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

  useEffect(() => {
    if (pathname === "/") {
      setMessages([]);
    }
  }, [pathname, setMessages]);

  const handleChatSubmit = () => {
    handleSubmit();
    if (messages.length === 0 && pathname === "/") {
      window.history.replaceState({}, "", `/chat/${chatId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col" key={pathname}>
      <div className="px-4 pb-5 md:pb-12 h-full">
        {messages.length === 0 && pathname === "/" ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ChatSuggestions setSuggestions={setInput} />
          </div>
        ) : (
          <div className="px-4 pb-5 md:pb-8 overflow-y-auto h-full">
            <Messages messages={messages} status={status} />
          </div>
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
