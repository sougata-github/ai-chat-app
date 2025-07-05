"use client";

import { suggestions } from "@/constants";
import { Button } from "../ui/button";

interface Props {
  setSuggestions: (suggestion: string) => void;
}

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <div className="mt-5">
      <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold">
        Start a conversation
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {suggestions.map((suggestion) => (
          <li key={suggestion} className="flex flex-col items-center">
            <Button
              className="w-full text-[13px] sm:text-sm font-medium py-5"
              variant="outline"
              onClick={() => setSuggestions(suggestion)}
            >
              {suggestion}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSuggestions;
