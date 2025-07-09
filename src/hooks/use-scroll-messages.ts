"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "ai";

interface UseScrollMessagesProps {
  messages: Message[];
  status: "streaming" | "submitted" | "ready" | "error";
  isInitialLoad?: boolean;
  isFirstTimeChat?: boolean;
}

export function useScrollMessages({
  messages,
  status,
  isInitialLoad = false,
  isFirstTimeChat = false,
}: UseScrollMessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastMessageCountRef = useRef(0);
  const scrollPositionRef = useRef(0);

  const isAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom < 50; // More lenient threshold
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Store scroll position before scrolling
    scrollPositionRef.current = container.scrollHeight;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });

    setUserHasScrolledUp(false);
    setShouldAutoScroll(true);
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;
    const hasOverflow = scrollHeight > clientHeight;

    // Only update user scroll state if they actively scrolled up
    if (!isNearBottom && status !== "streaming") {
      setUserHasScrolledUp(true);
      setShouldAutoScroll(false);
    } else if (isNearBottom) {
      setUserHasScrolledUp(false);
      setShouldAutoScroll(true);
    }

    // Show scroll button when there's overflow and user is not at bottom
    // Also show when streaming is finished and user is not at bottom
    const shouldShowButton =
      hasOverflow &&
      !isNearBottom &&
      (status === "ready" || status === "error" || userHasScrolledUp);

    setShowScrollButton(shouldShowButton);
  }, [status, userHasScrolledUp]);

  // Handle initial load
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToBottom(false);
      }, 50);
    }
  }, [isInitialLoad, messages.length, scrollToBottom]);

  // Handle first time chat
  useEffect(() => {
    if (isFirstTimeChat && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom(false);
      }, 50);
    }
  }, [isFirstTimeChat, messages.length, scrollToBottom]);

  // Handle streaming messages with smooth scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Only auto-scroll during streaming if user hasn't scrolled up
    if (status === "streaming" && shouldAutoScroll && !userHasScrolledUp) {
      // Use requestAnimationFrame for smoother scrolling
      const smoothScroll = () => {
        const currentScrollHeight = container.scrollHeight;

        const clientHeight = container.clientHeight;
        const targetScrollTop = currentScrollHeight - clientHeight;

        // Only scroll if there's new content
        if (currentScrollHeight > scrollPositionRef.current) {
          container.scrollTop = targetScrollTop;
          scrollPositionRef.current = currentScrollHeight;
        }
      };

      requestAnimationFrame(smoothScroll);
    }
  }, [messages, status, shouldAutoScroll, userHasScrolledUp]);

  // Handle message count changes for non-streaming scenarios
  useEffect(() => {
    if (
      messages.length > lastMessageCountRef.current &&
      status !== "streaming"
    ) {
      if (shouldAutoScroll && !userHasScrolledUp) {
        setTimeout(() => {
          scrollToBottom(true);
        }, 100);
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [
    messages.length,
    status,
    shouldAutoScroll,
    userHasScrolledUp,
    scrollToBottom,
  ]);

  // Preserve scroll position during refresh
  const preserveScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // If user is at bottom, we want to stay at bottom after refresh
    if (isAtBottom()) {
      sessionStorage.setItem("chat-scroll-position", "bottom");
    } else {
      sessionStorage.setItem(
        "chat-scroll-position",
        container.scrollTop.toString()
      );
    }
  }, [isAtBottom]);

  // Restore scroll position after refresh
  const restoreScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const savedPosition = sessionStorage.getItem("chat-scroll-position");
    if (savedPosition === "bottom") {
      setTimeout(() => {
        scrollToBottom(false);
      }, 100);
    } else if (savedPosition) {
      container.scrollTop = Number.parseInt(savedPosition);
    }

    sessionStorage.removeItem("chat-scroll-position");
  }, [scrollToBottom]);

  return {
    messagesContainerRef,
    showScrollButton,
    scrollToBottom,
    handleScroll,
    preserveScrollPosition,
    restoreScrollPosition,
  };
}
