import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import InfiniteScroll from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";

import ChatItem, { ChatItemSkeleton } from "./ChatItem";

const ChatListSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 px-2">
      {[...new Array(25)].fill(0).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </div>
  );
};

const ChatList = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.chats.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5,
      }
    );

  const merged = {
    today: data?.pages.flatMap((p) => p.chats.today) ?? [],
    last7Days: data?.pages.flatMap((p) => p.chats.last7Days) ?? [],
    older: data?.pages.flatMap((p) => p.chats.older) ?? [],
  };

  return (
    <div className="overflow-y-auto pb-20">
      {isLoading && <ChatListSkeleton />}
      {/* today group */}

      {merged.today.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {merged.today.map((chat) => (
                //pass chat
                <ChatItem key={chat.id} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* last 7 Days group */}
      {merged.last7Days.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {merged.last7Days.map((chat) => (
                <ChatItem key={chat.id} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* older group */}
      {merged.older.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Older</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {merged.older.map((chat) => (
                <ChatItem key={chat.id} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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

export default ChatList;
