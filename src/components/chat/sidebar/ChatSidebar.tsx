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
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

const ChatSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { data, isLoading } = trpc.user.getCurrentUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

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
        ) : data && data.name === "Anonymous" ? (
          <LoginButton />
        ) : (
          <UserInfo
            name={data?.name ?? "John Doe"}
            image={data?.image ?? "https://avatar.vercel.sh/jack"}
            email={data?.email ?? "johndoe@example.com"}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
