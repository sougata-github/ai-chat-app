"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import type { UIMessage } from "ai";

interface UseScrollMessagesProps {
  isNewChat: boolean;
  chatId: string;
  messages: UIMessage[];
  status: "streaming" | "submitted" | "ready" | "error";
}

export function useScrollMessages({
  isNewChat,
  chatId,
  messages,
  status,
}: UseScrollMessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollBehavior | false>(
    false
  );

  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
    }
  }, [status]);

  useEffect(() => {
    if (scrollBehavior) {
      endRef.current?.scrollIntoView({
        behavior: scrollBehavior,
      });
      setScrollBehavior(false);
    }
  }, [scrollBehavior]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setScrollBehavior(behavior);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
        setShowScrollButton(!entry.isIntersecting);
      },
      { root: messagesContainerRef.current, threshold: 0.01 }
    );

    if (endRef.current) observer.observe(endRef.current);
    return () => observer.disconnect();
  }, []);

  const hasAutoScrolled = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (
      !isNewChat &&
      messages.length > 0 &&
      hasAutoScrolled.current !== chatId
    ) {
      scrollToBottom("instant");
      setHasSentMessage(false);
      hasAutoScrolled.current = chatId;
    }
  }, [chatId, isNewChat, messages.length, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0 && status === "submitted") {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [messages, status, scrollToBottom]);

  return {
    messagesContainerRef,
    endRef,
    isAtBottom,
    setIsAtBottom,
    hasSentMessage,
    showScrollButton,
    scrollToBottom,
  };
}
