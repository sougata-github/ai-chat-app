"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import ArchivedChatItem from "./ArchivedChatItem";

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
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.chats.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        isArchived: true,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const merged = {
    today: data?.pages.flatMap((p) => p.chats.today) ?? [],
    last7Days: data?.pages.flatMap((p) => p.chats.last7Days) ?? [],
    older: data?.pages.flatMap((p) => p.chats.older) ?? [],
  };

  if (
    merged.today.length === 0 &&
    merged.today.length === 0 &&
    merged.today.length === 0
  )
    return (
      <p className="text-center p-4 pt-0 text-muted-foreground text-sm">
        No archived Chats
      </p>
    );

  return (
    <div className="flex flex-col gap-4 py-4 max-md:px-4">
      {isLoading && <ArchivedChatListSkeleton />}

      {/* today group */}
      {merged.today.length > 0 && (
        <div className="flex flex-col">
          Today
          <div className="flex flex-col gap-2 mt-2">
            {merged.today.map((chat) => (
              <ArchivedChatItem
                key={chat.id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* last 7 Days group */}
      {merged.last7Days.length > 0 && (
        <div className="flex flex-col">
          Last 7 Days
          <div className="flex flex-col gap-2 mt-2">
            {merged.last7Days.map((chat) => (
              <ArchivedChatItem
                key={chat.id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* older group */}
      {merged.older.length > 0 && (
        <div className="flex flex-col">
          Older
          <div className="flex flex-col gap-2 mt-2">
            {merged.older.map((chat) => (
              <ArchivedChatItem
                key={chat.id}
                chat={chat}
                onOpenChange={onOpenChange}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading &&
        data?.pages[0]?.chats &&
        (data.pages[0].chats.today.length > 0 ||
          data.pages[0].chats.last7Days.length > 0 ||
          data.pages[0].chats.older.length > 0) && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
    </div>
  );
};

export default ArchivedChatList;
