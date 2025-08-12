"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Copy, FileIcon, RefreshCcw } from "lucide-react";
import { cn, sanitizeText } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import LoadingSkeleton from "./LoadingSkeleton";
import ImageDisplay from "./ImageDisplay";
import WebSearchCard from "./WebSearch";
import WeatherCard from "./WeatherCard";
import ReasoningBlock from "./ReasoningBlock";
import type { InferUITool, UIMessage } from "ai";
import {
  generateImageTool,
  getWeatherTool,
  webSearchTool,
} from "@/lib/tools/tool";

interface Props {
  message: UIMessage;
  regenerate: ({ messageId }: { messageId: string }) => void;
  status: "streaming" | "submitted" | "ready" | "error";
}

const MessageItem = ({ message, regenerate, status }: Props) => {
  const isUser = message.role === "user";
  const fileAttachment = message.parts.find((part) => part.type === "file");
  const [copied, setCopied] = useState(false);

  const reasoningPart = message.parts.find((part) => part.type === "reasoning");
  const otherParts = message.parts.filter((part) => part.type !== "reasoning");

  const getCleanTextContent = () => {
    const textParts = message.parts.filter((part) => part.type === "text");
    return textParts.map((part) => part.text).join(" ");
  };

  const handleCopy = async () => {
    const textContent = getCleanTextContent();
    if (textContent) {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    regenerate({ messageId: message.id });
  };

  if (message.parts.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 group",
        isUser ? "py-2.5 items-end" : " py-6 md:py-10"
      )}
    >
      <div className={cn("w-full", isUser && "flex justify-end")}>
        <div
          className={cn(
            "px-4 rounded-lg whitespace-pre-wrap text-sm sm:text-[15px] relative",
            isUser
              ? "py-2.5 bg-muted-foreground/10 max-w-[300px] md:max-w-md break-words"
              : "bg-transparent w-full break-words"
          )}
        >
          {/* user file attachments */}
          {isUser && fileAttachment && (
            <div className="p-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {fileAttachment.mediaType.startsWith("image") ? (
                  <div className="relative max-h-[200px]">
                    <Image
                      priority
                      quality={100}
                      src={fileAttachment.url ?? "https://placehold.co/200x100"}
                      alt={`Image ${fileAttachment.filename} uploaded by user`}
                      height={120}
                      width={320}
                      className="w-80 object-cover rounded"
                    />
                  </div>
                ) : (
                  <FileIcon className="size-4" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {fileAttachment.filename}
              </span>
            </div>
          )}

          {/* reasoning block */}
          {reasoningPart && (
            <div className="mb-4">
              <ReasoningBlock
                reasoningText={reasoningPart.text}
                isStreaming={
                  reasoningPart.state === "streaming" &&
                  message.parts[message.parts.length - 1] === reasoningPart
                }
              />
            </div>
          )}

          {otherParts.map((part, index) => {
            const key = `message-${message.id}-part-${index}`;
            const { type } = part;

            if (type === "tool-generateImageTool") {
              const { state, toolCallId } = part;
              switch (state) {
                case "input-available":
                  return (
                    <div key={toolCallId}>
                      <LoadingSkeleton type="image" />
                    </div>
                  );
                case "output-available": {
                  const { output } = part;
                  return (
                    <div key={toolCallId}>
                      <ImageDisplay
                        data={
                          output as InferUITool<
                            typeof generateImageTool
                          >["output"]
                        }
                      />
                    </div>
                  );
                }
                case "output-error":
                  return (
                    <div key={toolCallId} className="mt-3">
                      <p className="text-sm sm:text-[15px] text-red-500">
                        Error generating the image.
                      </p>
                    </div>
                  );
              }
            }

            if (type === "tool-webSearchTool") {
              const { state, toolCallId } = part;
              switch (state) {
                case "input-available":
                  return (
                    <div key={toolCallId}>
                      <LoadingSkeleton type="web-search" />
                    </div>
                  );
                case "output-available": {
                  const { output, input } = part;
                  return (
                    <div key={toolCallId}>
                      <WebSearchCard
                        results={
                          output as InferUITool<typeof webSearchTool>["output"]
                        }
                        input={
                          input as InferUITool<typeof webSearchTool>["input"]
                        }
                      />
                    </div>
                  );
                }
                case "output-error":
                  return (
                    <div key={toolCallId} className="mt-3">
                      <p className="text-sm sm:text-[15px] text-red-500">
                        Error generating search results.
                      </p>
                    </div>
                  );
              }
            }

            if (type === "tool-getWeatherTool") {
              const { state, toolCallId } = part;
              switch (state) {
                case "input-available":
                  return (
                    <div key={toolCallId}>
                      <LoadingSkeleton type="weather" />
                    </div>
                  );
                case "output-available": {
                  const { output } = part;
                  return (
                    <div key={toolCallId}>
                      <WeatherCard
                        data={
                          output as InferUITool<typeof getWeatherTool>["output"]
                        }
                      />
                    </div>
                  );
                }
                case "output-error":
                  return (
                    <div key={toolCallId} className="mt-3">
                      <p className="text-sm sm:text-[15px] text-red-500">
                        Error fetching weather.
                      </p>
                    </div>
                  );
              }
            }

            if (type === "text") {
              return isUser ? (
                <span key={key}>{part.text}</span>
              ) : (
                <MemoizedMarkdown
                  key={key}
                  id={message.id}
                  content={sanitizeText(part.text) ?? ""}
                />
              );
            }

            return null;
          })}
        </div>
      </div>
      <div
        className={cn(
          "group-hover:opacity-100 opacity-0 transition-opacity duration-400 flex items-center gap-2 pl-4 mt-1"
        )}
      >
        {isUser && (
          <button
            onClick={handleRegenerate}
            className="bg-transparent disabled:text-muted-foreground"
            disabled={status !== "ready"}
          >
            <RefreshCcw className="size-3.5" />
          </button>
        )}

        <button
          onClick={handleCopy}
          className={cn(
            "bg-transparent",
            status !== "ready" && !isUser && "opacity-0"
          )}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageItem;
