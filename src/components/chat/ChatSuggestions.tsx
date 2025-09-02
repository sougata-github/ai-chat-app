"use client";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { suggestionCategories } from "@/constants";
import { cn } from "@/lib/utils";

interface Props {
  setSuggestions: (suggestion: string) => void;
}

const ChatSuggestions = ({ setSuggestions }: Props) => {
  return (
    <>
      <div className="sm:flex items-center justify-center hidden">
        <ul className="flex flex-wrap gap-3 sm:gap-4 mt-2 justify-center w-full max-w-3xl">
          {suggestionCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <li key={cat.tag} className="flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded-lg gap-2 dark:bg-transparent dark:hover:bg-muted-foreground/5",
                        "transition-colors"
                      )}
                      aria-label={`Open ${cat.tag} suggestions`}
                    >
                      <CatIcon className="size-4" aria-hidden="true" />
                      <span className="text-xs sm:text-sm text-pretty">
                        {cat.tag}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="center"
                    className={cn(
                      "w-72 sm:w-80",
                      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                    )}
                  >
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.value}
                          className="flex items-start gap-2 py-3"
                          onSelect={() => setSuggestions(item.value)}
                        >
                          <ItemIcon
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm leading-5">
                              {item.label}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </div>

      {/* for mobile */}
      <div className="flex items-center justify-center sm:hidden">
        <ul className="flex flex-wrap gap-2 justify-start w-full max-w-3xl">
          {suggestionCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <li
                key={cat.tag}
                className="flex flex-col w-full items-start border-b last:border-none py-1"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "rounded-md gap-2 dark:bg-transparent dark:hover:bg-muted-foreground/5",
                        "transition-colors w-full text-left justify-start font-medium"
                      )}
                      aria-label={`Open ${cat.tag} suggestions`}
                    >
                      <CatIcon className="size-4" aria-hidden="true" />
                      <span className="text-sm text-left">
                        {cat.items[0].label}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="start"
                    className={cn(
                      "w-72 sm:w-80",
                      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                    )}
                  >
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.value}
                          className="flex items-start gap-2 py-3"
                          onSelect={() => setSuggestions(item.value)}
                        >
                          <ItemIcon
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm leading-5">
                              {item.label}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default ChatSuggestions;
