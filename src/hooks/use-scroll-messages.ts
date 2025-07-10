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
  // Ref to scrollable container (div with overflow)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Ref to the last message DOM node
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Whether to show the "scroll to bottom" button
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Whether the user has manually scrolled up
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Whether we should auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Tracks the previous message count
  const lastMessageCountRef = useRef(0);

  // Returns true if user is close to the bottom
  const isAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 50;
  }, []);

  // Scroll to bottom with optional smooth animation
  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });

    setUserHasScrolledUp(false);
    setShouldAutoScroll(true);
    setShowScrollButton(false); // Hide button after scroll
  }, []);

  // Track scroll position to detect manual scroll up/down
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const isNearBottom = distanceFromBottom < 100;

    setUserHasScrolledUp(!isNearBottom);
    setShouldAutoScroll(isNearBottom);

    // Fallback: hide button if at exact bottom
    if (isAtBottom()) {
      setShowScrollButton(false);
    } else if (!isNearBottom) {
      setShowScrollButton(true);
    }
  }, [isAtBottom]);

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Track visibility of the last message using IntersectionObserver
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
        threshold: 0.98,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [messages]);

  // Scroll to bottom when visiting a chat (first load)
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [isInitialLoad, messages.length, scrollToBottom]);

  // Scroll after submitting first prompt (on home)
  useEffect(() => {
    if (isFirstTimeChat && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [isFirstTimeChat, messages.length, scrollToBottom]);

  // Scroll after response finishes, if allowed
  useEffect(() => {
    if (
      status === "ready" &&
      shouldAutoScroll &&
      !userHasScrolledUp &&
      messages.length > lastMessageCountRef.current
    ) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [
    messages.length,
    status,
    shouldAutoScroll,
    userHasScrolledUp,
    scrollToBottom,
  ]);

  // Keep track of previous message count
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
  };
}
