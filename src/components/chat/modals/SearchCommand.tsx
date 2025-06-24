"use client";

import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import Link from "next/link";
import { useState, useEffect } from "react";
import InfiniteScroll from "@/components/InfiniteScroll";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.chats.search.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        query: debouncedQuery,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: open,
      }
    );

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
          data?.pages?.flatMap((page) =>
            page.chats.map((chat) => (
              <CommandItem
                key={chat.id}
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
            ))
          )}

        {!isLoading &&
          data?.pages &&
          data?.pages[0]?.chats.length > 0 &&
          hasNextPage && (
            <InfiniteScroll
              isManual
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
