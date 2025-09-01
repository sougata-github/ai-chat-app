"use client";

import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import Link from "next/link";
import { useState, useEffect } from "react";
import InfiniteScroll from "@/components/InfiniteScroll";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchChatListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 px-2 pb-4">
      {[...new Array(5)].fill(0).map((_, index) => (
        <Skeleton className="h-4 rounded-lg" key={index} />
      ))}
    </div>
  );
};

const SearchCommand = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const { results, status, loadMore } = usePaginatedQuery(
    api.chats.search,
    { query: debouncedQuery },
    { initialNumItems: 10 }
  );

  const isLoading = status === "LoadingMore" || status === "LoadingFirstPage";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search your chats..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="px-2 py-4">
        <CommandEmpty>No chats found.</CommandEmpty>

        {isLoading && <SearchChatListSkeleton />}

        {!isLoading &&
          results.map((chat) => (
            <CommandItem
              key={chat._id}
              value={chat.title}
              title={chat.title}
              asChild
              className="cursor-pointer rounded-lg h-8 mt-2 first:mt-0"
            >
              <Link
                href={`/chat/${chat.id}`}
                onClick={() => onOpenChange(false)}
              >
                {chat.title}
              </Link>
            </CommandItem>
          ))}
        <InfiniteScroll
          hasNextPage={!isLoading && !!loadMore}
          isFetchingNextPage={status === "LoadingMore"}
          fetchNextPage={loadMore}
        />
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
