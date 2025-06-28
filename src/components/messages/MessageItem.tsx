"use client";

import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";

interface Props {
  message: {
    id: string;
    role: string;
    content: string | null;
    createdAt?: Date;
  };
}

const MessageItem = ({ message }: Props) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("w-full", isUser && "flex justify-end")}>
      <div
        className={cn(
          "px-4 py-2.5 rounded-lg whitespace-pre-wrap text-sm sm:text-[15px]",
          isUser
            ? "bg-muted-foreground/10 max-w-[300px] md:max-w-md lg:max-w-xl"
            : "bg-transparent w-full"
        )}
      >
        {message.content ? (
          isUser ? (
            message.content
          ) : (
            <MemoizedMarkdown id={message.id} content={message.content} />
          )
        ) : null}
      </div>
    </div>
  );
};

export default MessageItem;
