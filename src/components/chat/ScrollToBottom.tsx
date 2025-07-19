"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

const ScrollToBottom = ({ onClick, show }: ScrollToBottomButtonProps) => {
  return (
    <div
      className={cn(
        "absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-in-out",
        show
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Button
        onClick={onClick}
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg border bg-background/95 backdrop-blur-sm transition-all duration-200"
      >
        <ArrowDown className="size-4" />
        <span className="sr-only">Scroll to bottom</span>
      </Button>
    </div>
  );
};

export default ScrollToBottom;
