"use client";

import { Message } from "ai";
import MessageItem from "./MessageItem";

interface Props {
  messages: Message[];
  status: "streaming" | "submitted" | "ready" | "error";
}

const Messages = ({ messages, status }: Props) => {
  if (messages.length === 0)
    <p className="text-center">No messages in this chat.</p>;

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {messages.map((message) => (
        <MessageItem message={message} key={message.id} />
      ))}
      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start">
            <div className="px-4 py-2.5 whitespace-pre-wrap">Generating...</div>
          </div>
        )}
      {status === "error" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex w-full justify-start">
            <div className="px-4 py-2.5 whitespace-pre-wrap bg-destructive rounded-lg">
              There was an error generating the response.
            </div>
          </div>
        )}
    </div>
  );
};

export default Messages;
