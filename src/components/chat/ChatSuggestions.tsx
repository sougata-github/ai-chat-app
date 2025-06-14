import { suggestions } from "@/constants";

import { Button } from "../ui/button";

const ChatSuggestions = () => {
  return (
    <div className="max-w-5xl flex flex-col gap-2 mx-auto mt-20 overflow-x-hidden">
      <h1 className="text-3xl md:text-5xl font-bold">
        What&apos;s on your mind
      </h1>
      <ul className="flex flex-col gap-4 mt-5">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion}
            className="border-b last:border-b-0 last:border-none flex flex-col"
          >
            <Button
              className="flex-shrink-0 justify-start w-full mb-1 last:-mt-2 pl-1.5 max-md:text-sm"
              variant="ghost"
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
