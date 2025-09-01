"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import ArchivedChatItem from "./ArchivedChatItem";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const ArchivedChatListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {[...new Array(5)].fill(0).map((_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="h-1 rounded-md" />
          <Skeleton className="h-4 rounded" />
        </div>
      ))}
    </div>
  );
};

interface Props {
  onOpenChange: (open: boolean) => void;
}

const ArchivedChatList = ({ onOpenChange }: Props) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.chats.getMany,
    { isArchived: true },
    { initialNumItems: 10 }
  );

  const isLoading = status === "LoadingMore" || status === "LoadingFirstPage";

  const allChats = results;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const grouped = {
    today: allChats.filter((chat) => new Date(chat.updatedAt) >= startOfToday),
    last7Days: allChats.filter((chat) => {
      const updatedAt = new Date(chat.updatedAt);
      return updatedAt < startOfToday && updatedAt >= sevenDaysAgo;
    }),
    older: allChats.filter((chat) => new Date(chat.updatedAt) < sevenDaysAgo),
  };

  if (
    grouped.today.length === 0 &&
    grouped.last7Days.length === 0 &&
    grouped.older.length === 0
  )
    return (
      <p className="text-muted-foreground pb-4 text-center text-sm">
        No archived Chats
      </p>
    );

  return (
    <div className="flex flex-col gap-4 py-4 max-md:px-4">
      {isLoading && <ArchivedChatListSkeleton />}

      {/* today group */}
      {grouped.today.length > 0 && (
        <div className="flex flex-col">
          Today
          <div className="flex flex-col gap-2 mt-2">
            {grouped.today.map((chat) => (
              <ArchivedChatItem
                key={chat._id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* last 7 Days group */}
      {grouped.last7Days.length > 0 && (
        <div className="flex flex-col">
          Last 7 Days
          <div className="flex flex-col gap-2 mt-2">
            {grouped.last7Days.map((chat) => (
              <ArchivedChatItem
                key={chat._id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* older group */}
      {grouped.older.length > 0 && (
        <div className="flex flex-col">
          Older
          <div className="flex flex-col gap-2 mt-2">
            {grouped.older.map((chat) => (
              <ArchivedChatItem
                key={chat._id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      <InfiniteScroll
        hasNextPage={!isLoading && !!loadMore}
        isFetchingNextPage={status === "LoadingMore"}
        fetchNextPage={loadMore}
      />
    </div>
  );
};

export default ArchivedChatList;
