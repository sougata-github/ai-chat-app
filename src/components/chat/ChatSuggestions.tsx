"use client";

import { suggestions } from "@/constants";
import { Button } from "../ui/button";
import React from "react";
import { useSidebar } from "../ui/sidebar";

interface Props {
  setSuggestions: (suggestion: string) => void;
}

interface BlockProps {
  title: string;
  description: string;
  icon: React.ElementType<{ className?: string }>;
  tag: string;
  setSuggestions: (suggestion: string) => void;
}

const Block = ({ title, icon: Icon, tag, setSuggestions }: BlockProps) => {
  const { isMobile } = useSidebar();

  return (
    <Button
      className="rounded-lg gap-2 w-full justify-center dark:bg-transparent dark:hover:bg-muted-foreground/5"
      variant="outline"
      size={isMobile ? "sm" : "default"}
      onClick={() => setSuggestions(title)}
    >
      {<Icon className="size-4" />}
      <div className="flex flex-col items-start overflow-hidden">
        <span className="text-xs sm:text-sm inline">{tag}</span>
      </div>
    </Button>
  );
};

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <div className="flex items-center justify-center">
      <ul className="flex flex-wrap gap-4 mt-2 justify-center">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.title}
            className="flex flex-col items-center justify-center"
          >
            <Block {...suggestion} setSuggestions={setSuggestions} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSuggestions;
