"use client";

import { Message } from "ai";
import MessageItem from "./MessageItem";
import Thinking from "./Thinking";
import { RefObject } from "react";
import { usePathname } from "next/navigation";
interface Props {
  messages: Message[];
  status: "streaming" | "submitted" | "ready" | "error";
  lastMessageRef: RefObject<HTMLDivElement | null>;
}

const Messages = ({ messages, status, lastMessageRef }: Props) => {
  const pathname = usePathname();

  if (messages.length === 0)
    return (
      <div className="sticky top-[50%] flex items-center justify-center overflow-hidden max-w-xl mx-auto">
        Start a new conversation
      </div>
    );

  return (
    <div className="flex flex-col gap-5 md:gap-8 max-w-3xl w-full mx-auto pt-10">
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;
        return (
          <div key={message.id} ref={isLast ? lastMessageRef : undefined}>
            <MessageItem message={message} status={status} />
          </div>
        );
      })}

      {status === "submitted" &&
        pathname !== "/" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start">
            <Thinking />
          </div>
        )}
      {status === "error" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start">
            <div className="px-4 py-2.5 whitespace-pre-wrap bg-destructive rounded-lg dark:text-foreground text-background">
              There was an error generating the response.
            </div>
          </div>
        )}
    </div>
  );
};

export default Messages;
