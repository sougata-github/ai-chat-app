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
    <div className={cn(isUser && "w-fit ml-auto")}>
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl whitespace-pre-wrap",
          isUser
            ? "bg-muted-foreground/20 max-w-[300px] md:max-w-md lg:max-w-xl"
            : "bg-transparent"
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
