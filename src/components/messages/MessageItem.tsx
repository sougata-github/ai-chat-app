/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import type { Message } from "ai";
import LoadingSkeleton from "./LoadingSkeleton";
import ImageDisplay from "./ImageDisplay";
import WebSearchCard from "./WebSearch";

interface Props {
  message: Message;
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
        {/* display tool invocations */}
        {message.parts?.map((part, index) => {
          const { type } = part;
          const key = `message-${message.id}-part-${index}`;

          if (type === "tool-invocation") {
            const { toolInvocation } = part;
            const { toolName, toolCallId, state } = toolInvocation;

            if (state === "partial-call") {
              return (
                <div key={toolCallId} className="mt-3">
                  {toolName === "generateImageTool" ? (
                    <p className="text-sm sm:text-[15px]">Generating Image</p>
                  ) : toolName === "webSearchTool" ? (
                    <p className="text-sm sm:text-[15px]">Searching the web</p>
                  ) : null}
                </div>
              );
            }

            if (state === "call") {
              return (
                <div key={toolCallId} className="mt-3">
                  {toolName === "generateImageTool" ? (
                    <LoadingSkeleton type="image" />
                  ) : toolName === "webSearchTool" ? (
                    <LoadingSkeleton type="web-search" />
                  ) : null}
                </div>
              );
            }

            if (state === "result") {
              const { result } = toolInvocation;

              return (
                <div key={toolCallId} className="mt-3">
                  {toolName === "generateImageTool" ? (
                    <ImageDisplay
                      imageUrl={result.imageUrl}
                      prompt={result.prompt}
                    />
                  ) : toolName === "webSearchTool" ? (
                    <WebSearchCard
                      results={result}
                      query={toolInvocation.args.query}
                    />
                  ) : (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              );
            }
          }

          return null;
        })}

        {/* display text content */}
        {message.content &&
          (isUser ? (
            message.content
          ) : (
            <MemoizedMarkdown id={message.id} content={message.content} />
          ))}
      </div>
    </div>
  );
};

export default MessageItem;
