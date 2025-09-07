"use client";

import * as React from "react";

import UserInfo from "./UserInfo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { WandSparkles } from "lucide-react";

import SidebarUtils from "./SidebarUtils";
import ChatList from "./ChatList";
import LoginButton from "./LoginButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

const ChatSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const userData = useQuery(api.auth.getCurrentUser);
  const resetQuota = useMutation(api.auth.resetUserQuota);

  const hasResetRef = React.useRef(false);

  React.useEffect(() => {
    if (userData && !hasResetRef.current) {
      void resetQuota({});
      hasResetRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const isLoading = userData === undefined;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-3.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="p-1.5 flex gap-2 items-center">
              <WandSparkles className="!size-5" />
              <span className="text-base font-semibold">Ai Chat</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarUtils />

        <SidebarSeparator />
        <ChatList />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <Skeleton className="h-5 rounded-md" />
        ) : userData && userData.name === "Anonymous" ? (
          <LoginButton />
        ) : (
          <UserInfo
            name={userData?.name ?? "John Doe"}
            image={userData?.image ?? "https://avatar.vercel.sh/jack"}
            email={userData?.email ?? "johndoe@example.com"}
            messageCount={userData?.messageCount ?? 0}
            lastReset={userData?.lastReset ?? null}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
