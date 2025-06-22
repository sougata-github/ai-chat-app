"use client";

import { cn } from "@/lib/utils";

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
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl whitespace-pre-wrap",
          isUser ? "bg-muted-foreground/20" : "bg-transparent"
        )}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageItem;
