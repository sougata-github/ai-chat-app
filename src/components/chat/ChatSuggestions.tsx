"use client";

import { suggestions } from "@/constants";
import { Button } from "../ui/button";
import React from "react";

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

const Block = ({
  title,
  description,
  icon: Icon,
  tag,
  setSuggestions,
}: BlockProps) => {
  return (
    <Button
      className="rounded-full sm:rounded-xl py-5 gap-2 sm:py-8 sm:gap-3.5 w-full justify-center sm:justify-start dark:bg-transparent dark:hover:bg-muted-foreground/5"
      variant="outline"
      onClick={() => setSuggestions(title)}
    >
      {<Icon className="size-4" />}
      <div className="flex flex-col items-start overflow-hidden">
        <span className="font-medium text-[13px] lg:text-sm hidden sm:inline">
          {title}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {description}
        </span>
        <span className="text-sm inline sm:hidden">{tag}</span>
      </div>
    </Button>
  );
};

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <div className="mt-5 sm:mt-8 max-w-xl">
      <h1 className="text-2xl text-center sm:text-4xl md:text-5xl font-semibold">
        Hi there
      </h1>
      <p className="text-lg text-center sm:text-xl font-medium">
        How can I help you today?
      </p>
      <ul className="grid grid-cols-2 gap-4 mt-8 sm:mt-10">
        {suggestions.map((suggestion) => (
          <li key={suggestion.title} className="flex flex-col items-center">
            <Block {...suggestion} setSuggestions={setSuggestions} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSuggestions;
