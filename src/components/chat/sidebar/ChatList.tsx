import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, } from "@/components/ui/sidebar";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import InfiniteScroll from "@/components/InfiniteScroll";
import { api } from "@convex/_generated/api";

import ChatItem, { ChatItemSkeleton } from "./ChatItem";


const ChatListSkeleton = () => (
  <div className="flex flex-col gap-3 px-2">
    {Array.from({ length: 25 }).map((_, index) => (
      <ChatItemSkeleton key={index} />
    ))}
  </div>
);

const ChatList = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.chats.getMany,
    { isArchived: false },
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

  return (
    <div className="overflow-y-auto pb-20">
      {isLoading && <ChatListSkeleton />}

      {/* Today */}
      {grouped.today.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {grouped.today.map((chat) => (
                <ChatItem key={chat._id} chat={chat} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Last 7 Days */}
      {grouped.last7Days.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {grouped.last7Days.map((chat) => (
                <ChatItem key={chat._id} chat={chat} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Older */}
      {grouped.older.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Older</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {grouped.older.map((chat) => (
                <ChatItem key={chat._id} chat={chat} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {grouped.last7Days.length > 0 ||
        grouped.older.length > 0 ||
        (grouped.today.length > 0 && (
          <InfiniteScroll
            hasNextPage={!isLoading && !!loadMore}
            isFetchingNextPage={status === "LoadingMore"}
            fetchNextPage={loadMore}
          />
        ))}
    </div>
  );
};

export default ChatList;
