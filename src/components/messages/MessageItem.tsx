"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { Check, Copy, FileIcon, PenSquareIcon, RotateCw } from "lucide-react";
import { cn, sanitizeText } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import LoadingSkeleton from "./LoadingSkeleton";
import ImageDisplay from "./ImageDisplay";
import WebSearchCard from "./WebSearch";
import WeatherCard from "./WeatherCard";
import MarketResearchCard from "./MarketResearchCard";
import ReasoningBlock from "./ReasoningBlock";
import type { InferUITool, UIMessage } from "ai";
import {
  generateImageTool,
  getWeatherTool,
  webSearchTool,
  marketResearchTool,
} from "@/lib/tools/tool";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Doc } from "@convex/_generated/dataModel";
import { useUsageStatus } from "@/hooks/use-usage-status";

interface Props {
  updateChat: () => void;
  setMessageToEdit: (message: Doc<"messages">) => void;
  setHandleRegenerate: React.Dispatch<
    React.SetStateAction<(() => Promise<void>) | undefined>
  >;
  setHiddenMessageIds: Dispatch<SetStateAction<Set<string>>>;
  message: UIMessage;
  regenerate: ({ messageId }: { messageId: string }) => void;
  status: "streaming" | "submitted" | "ready" | "error";
  chatId: string;
}

const MessageItem = ({
  updateChat,
  setMessageToEdit,
  setHandleRegenerate,
  message,
  regenerate,
  status,
  chatId,
  setHiddenMessageIds,
}: Props) => {
  const isUser = message.role === "user";
  const fileAttachment = message.parts.find((part) => part.type === "file");
  const [copied, setCopied] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const messageToRegenerate = useQuery(api.chats.getMessagesByUUID, {
    messageId: message.id,
  });

  const allMessages = useQuery(api.chats.getMessagesByChatId, { chatId });
  const deleteMessage = useMutation(api.chats.deleteMessage);

  const { canSend } = useUsageStatus();

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

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      toast.success("Regenerating response");
      if (allMessages && messageToRegenerate) {
        const toRemoveIds = allMessages
          .filter((msg) => msg.createdAt > messageToRegenerate.createdAt)
          .map((msg) => msg.id);

        setHiddenMessageIds((prev) => {
          const updated = new Set(prev);
          toRemoveIds.forEach((id) => updated.add(id));
          return updated;
        });

        await Promise.all(toRemoveIds.map((id) => deleteMessage({ id })));
      }

      regenerate({ messageId: message.id });
      updateChat();
    } catch (error) {
      setIsRegenerating(false);
      console.log("Error in Regenerating response", (error as Error).message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEdit = () => {
    if (messageToRegenerate) {
      setMessageToEdit(messageToRegenerate);
    }

    setHandleRegenerate(() => handleRegenerate);
  };

  if (message.parts.length === 0) return null;

  return (
    <div
      className={cn("flex flex-col group gap-1 py-2", isUser && "items-end")}
    >
      <div className={cn("w-full", isUser && "flex justify-end")}>
        <div
          className={cn(
            "px-4 rounded-lg whitespace-pre-wrap text-sm sm:text-[15px] relative",
            isUser
              ? "dark:bg-muted-foreground/15 bg-muted-foreground/5 font-medium max-w-[300px] md:max-w-md break-words py-2"
              : "bg-transparent w-full break-words"
          )}
        >
          {/* user file attachments */}
          {isUser && fileAttachment && (
            <div className="p-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-foreground">
                {fileAttachment.mediaType.startsWith("image") ? (
                  <div className="relative">
                    <Image
                      priority
                      quality={100}
                      src={fileAttachment.url ?? "https://placehold.co/200x100"}
                      alt={`Image ${fileAttachment.filename} uploaded by user`}
                      height={200}
                      width={320}
                      className="w-80 object-cover rounded"
                    />
                  </div>
                ) : (
                  <FileIcon className="size-4" />
                )}
              </div>
              <span className="text-xs text-foreground">
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

            if (type === "tool-marketResearchTool") {
              const { state, toolCallId } = part;
              switch (state) {
                case "input-available":
                  return (
                    <div key={toolCallId}>
                      <LoadingSkeleton type="market-research" />
                    </div>
                  );
                case "output-available": {
                  const { output, input } = part;
                  return (
                    <div key={toolCallId}>
                      <MarketResearchCard
                        data={
                          output as InferUITool<typeof marketResearchTool>["output"]
                        }
                        input={
                          input as InferUITool<typeof marketResearchTool>["input"]
                        }
                      />
                    </div>
                  );
                }
                case "output-error":
                  return (
                    <div key={toolCallId} className="mt-3">
                      <p className="text-sm sm:text-[15px] text-red-500">
                        Error performing market research.
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
          "sm:group-hover:opacity-100 sm:opacity-0 transition-opacity duration-400 flex items-center gap-3 pl-4 mt-1  text-muted-foreground"
        )}
      >
        {isUser && (
          <button
            onClick={handleEdit}
            className="bg-transparent"
            disabled={status !== "ready" || isRegenerating || !canSend}
          >
            <PenSquareIcon className="size-3 sm:size-3.5" />
          </button>
        )}

        {isUser && (
          <button
            onClick={handleRegenerate}
            className="bg-transparent"
            disabled={status !== "ready" || isRegenerating || !canSend}
          >
            <RotateCw className="size-3 sm:size-3.5" />
          </button>
        )}

        <button onClick={handleCopy} className={cn("bg-transparent")}>
          {copied ? (
            <Check className="size-3.5 sm:size-3.5" />
          ) : (
            <Copy className="size-3 sm:size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageItem;
