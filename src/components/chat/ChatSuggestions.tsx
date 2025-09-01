"use client";
import { useSidebar } from "../ui/sidebar";
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
  const { isMobile } = useSidebar();

  return (
    <div className="flex items-center justify-center">
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
                    size={isMobile ? "sm" : "default"}
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
  );
};

export default ChatSuggestions;
