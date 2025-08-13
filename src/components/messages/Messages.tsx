"use client";

import { UIMessage } from "ai";
import MessageItem from "./MessageItem";
import Thinking from "./Thinking";
import { RefObject } from "react";
import { cn } from "@/lib/utils";

interface Props {
  messages: UIMessage[];
  status: "streaming" | "submitted" | "ready" | "error";
  lastMessageRef: RefObject<HTMLDivElement | null>;
  regenerate: ({ messageId }: { messageId: string }) => void;
}

const Messages = ({ messages, status, lastMessageRef, regenerate }: Props) => {
  const lastMessage = messages.at(-1);

  const showLoader =
    (status === "submitted" &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user") ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      lastMessage?.parts?.length === 0);

  if (messages.length === 0)
    return (
      <div className="sticky top-[50%] flex items-center justify-center overflow-hidden max-w-xl mx-auto">
        Start a new conversation
      </div>
    );

  return (
    <div className={cn("flex flex-col gap-0 max-w-3xl w-full mx-auto pt-10")}>
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;
        return (
          <div
            key={`${message.id}-${index}`}
            ref={isLast ? lastMessageRef : undefined}
          >
            <MessageItem
              message={message}
              regenerate={regenerate}
              status={status}
            />
          </div>
        );
      })}

      {showLoader && (
        <div className="flex w-full justify-start pt-4 md:pt-6 pl-4">
          <Thinking size="sm" />
        </div>
      )}

      {status === "error" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start pt-4 md:pt-6 pl-4">
            <div className="px-4 py-2 whitespace-pre-wrap bg-destructive/80 rounded-lg dark:text-foreground text-background">
              There was an error generating the response.
            </div>
          </div>
        )}
    </div>
  );
};

export default Messages;
