"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { UIMessage } from "ai";

type ChatStatus = "streaming" | "submitted" | "ready" | "error";

interface UseScrollMessagesProps {
  chatId: string;
  messages: UIMessage[];
  status: ChatStatus;
  isFirstTimeChat?: boolean;
}

export function useScrollMessages({
  chatId,
  messages,
  status,
  isFirstTimeChat = false,
}: UseScrollMessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const lastMessageCountRef = useRef(0);

  const [hasSentMessage, setHasSentMessage] = useState(false);

  const isAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, clientHeight, scrollHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 180;
  }, []);

  const scrollToBottom = useCallback(
    (behavior: "smooth" | "auto" | "instant" = "smooth") => {
      const container = messagesContainerRef.current;
      if (!container) return;

      if (behavior === "smooth") {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      } else {
        container.scrollTop = container.scrollHeight;
      }

      setUserHasScrolledUp(false);
      setShouldAutoScroll(true);
      setShowScrollButton(false);
    },
    []
  );

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, clientHeight, scrollHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;

    setUserHasScrolledUp(!isNearBottom);
    setShouldAutoScroll(isNearBottom);

    if (isAtBottom()) {
      setShowScrollButton(false);
    } else if (!isNearBottom) {
      setShowScrollButton(true);
    }
  }, [isAtBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const target = lastMessageRef.current;
    const container = messagesContainerRef.current;
    if (!target || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setShowScrollButton(!isVisible);
        if (isVisible) {
          setUserHasScrolledUp(false);
        }
      },
      {
        root: container,
        threshold: 0.8,
      }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [messages]);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      setUserHasScrolledUp(false);
      setShouldAutoScroll(true);
      setShowScrollButton(false);
    });

    setHasSentMessage(false);

    return () => cancelAnimationFrame(raf);
  }, [chatId]);

  useEffect(() => {
    if (isFirstTimeChat && messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [isFirstTimeChat, messages.length, scrollToBottom]);

  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
      scrollToBottom("smooth");
    }

    setHasSentMessage(false);
  }, [
    status,
    messages.length,
    scrollToBottom,
    shouldAutoScroll,
    userHasScrolledUp,
  ]);

  useEffect(() => {
    lastMessageCountRef.current = messages.length;
  }, [messages.length]);

  return {
    messagesContainerRef,
    lastMessageRef,
    showScrollButton,
    scrollToBottom,
    handleScroll,
    isAtBottom,
    hasSentMessage,
  };
}
