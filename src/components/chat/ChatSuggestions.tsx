import { suggestions } from "@/constants";

import { Button } from "../ui/button";

interface Props {
  setSuggestions: (suggestion: string) => void;
}

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <div className="max-w-5xl flex flex-col gap-2 mx-auto mt-10 sm:mt-20 overflow-x-hidden">
      <h1 className="text-2xl sm:text-4xl font-semibold">
        What&apos;s on your mind?
      </h1>
      <ul className="flex flex-col gap-4 mt-8">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion}
            className="border-b last:border-b-0 last:border-none flex flex-col"
          >
            <Button
              className="flex-shrink-0 justify-start w-full mb-1 last:-mt-2 pl-1.5 text-[13px] sm:text-sm font-medium"
              variant="ghost"
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
