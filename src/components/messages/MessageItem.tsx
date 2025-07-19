"use client";

import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import type { Message } from "ai";
import LoadingSkeleton from "./LoadingSkeleton";
import ImageDisplay from "./ImageDisplay";
import WebSearchCard from "./WebSearch";
import WeatherCard from "./WeatherCard";
import ReasoningBlock from "./ReasoningBlock";

interface Props {
  message: Message;
  status: "streaming" | "submitted" | "ready" | "error";
}

const MessageItem = ({ message, status }: Props) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("w-full", isUser && "flex justify-end")}>
      <div
        className={cn(
          "px-4 py-2.5 rounded-lg whitespace-pre-wrap text-sm sm:text-[15px]",
          isUser
            ? "bg-muted-foreground/10 max-w-[300px] md:max-w-md lg:max-w-xl break-words"
            : "bg-transparent w-full break-words"
        )}
      >
        {message.parts?.map((part, index) => {
          const { type } = part;
          const key = `message-${message.id}-part-${index}`;

          {
            /* display reasoning parts */
          }
          if (part.type === "reasoning") {
            return (
              <div key={key} className="mb-4">
                <ReasoningBlock
                  reasoning={part.reasoning as string}
                  isStreaming={
                    // @ts-expect-error export ReasoningUIPart
                    status === "streaming" && index === message.parts.length - 1
                  }
                />
              </div>
            );
          }

          {
            /* display tool invocations */
          }
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
                  ) : toolName === "getWeatherTool" ? (
                    <p className="text-sm sm:text-[15px]">
                      Getting weather data
                    </p>
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
                  ) : toolName === "getWeatherTool" ? (
                    <LoadingSkeleton type="weather" />
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
                  ) : toolName === "getWeatherTool" ? (
                    <WeatherCard data={result} />
                  ) : null}
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
