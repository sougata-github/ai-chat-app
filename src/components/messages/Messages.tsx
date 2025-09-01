"use client";

import { UIMessage } from "ai";
import MessageItem from "./MessageItem";
import Thinking from "./Thinking";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { Doc } from "@convex/_generated/dataModel";

interface Props {
  updateChat: () => void;
  setMessageToEdit: (message: Doc<"messages">) => void;
  setHandleRegenerate: React.Dispatch<
    React.SetStateAction<(() => Promise<void>) | undefined>
  >;
  setHiddenMessageIds: Dispatch<SetStateAction<Set<string>>>;
  messages: UIMessage[];
  status: "streaming" | "submitted" | "ready" | "error";
  regenerate: ({ messageId }: { messageId: string }) => void;
  chatId: string;
}

const Messages = ({
  updateChat,
  setMessageToEdit,
  setHandleRegenerate,
  setHiddenMessageIds,
  messages,
  status,
  regenerate,
  chatId,
}: Props) => {
  const lastMessage = messages.at(-1);
  const pathname = usePathname();

  const showLoader =
    (status === "submitted" &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user") ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      lastMessage?.parts?.length === 0);

  return (
    <div className={cn("flex flex-col gap-0 max-w-3xl w-full mx-auto pt-10")}>
      {messages.map((message, index) => {
        return (
          <div key={`${message.id}-${index}`}>
            <MessageItem
              updateChat={updateChat}
              setMessageToEdit={setMessageToEdit}
              setHandleRegenerate={setHandleRegenerate}
              chatId={chatId}
              status={status}
              message={message}
              regenerate={regenerate}
              setHiddenMessageIds={setHiddenMessageIds}
            />
          </div>
        );
      })}

      {showLoader && pathname !== "/" && (
        <div className="flex w-full justify-start pt-4 pl-4">
          <Thinking size="sm" />
        </div>
      )}

      {status === "error" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start pt-4 pl-4">
            <div className="px-4 py-2 whitespace-pre-wrap bg-destructive/80 rounded-lg dark:text-foreground text-background">
              There was an error generating the response.
            </div>
          </div>
        )}
    </div>
  );
};

export default Messages;
