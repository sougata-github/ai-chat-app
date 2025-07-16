"use client";

import { useEffect, useRef } from "react";
import type { Message } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

export type DataPart = { type: "append-message"; message: string };

interface Props {
  autoResume: boolean;
  initialMessages: Message[];
  experimental_resume: UseChatHelpers["experimental_resume"];
  data: UseChatHelpers["data"];
  setMessages: UseChatHelpers["setMessages"];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages,
}: Props) {
  const hasResumed = useRef(false);
  const processedDataIds = useRef(new Set<string>());

  useEffect(() => {
    if (!autoResume || hasResumed.current) return;

    const mostRecentMessage = initialMessages.at(-1);
    if (mostRecentMessage?.role === "user") {
      hasResumed.current = true;

      const timer = setTimeout(() => {
        try {
          experimental_resume();
        } catch (error) {
          console.error("Error resuming stream:", error);
          hasResumed.current = false;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResume, experimental_resume]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    try {
      data.forEach((item, index) => {
        const dataId = `${index}-${JSON.stringify(item)}`;

        if (processedDataIds.current.has(dataId)) {
          return;
        }

        const dataPart = item as DataPart;
        if (dataPart.type === "append-message") {
          const message = JSON.parse(dataPart.message) as Message;

          const messageExists = initialMessages.some(
            (m) => m.id === message.id
          );
          if (!messageExists) {
            setMessages([...initialMessages, message]);
          }

          processedDataIds.current.add(dataId);
        }
      });
    } catch (error) {
      console.error("Error processing resume data:", error);
    }
  }, [data, initialMessages, setMessages]);

  useEffect(() => {
    return () => {
      hasResumed.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      processedDataIds.current.clear();
    };
  }, []);
}
