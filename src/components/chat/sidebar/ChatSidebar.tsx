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
// import LoginButton from "./LoginButton";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

const ChatSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  //todo: fetch user chats: chats.getMany (not prefetch)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              prefetch
              href="/chat"
              className="p-1.5 flex gap-2 items-center"
            >
              <WandSparkles className="!size-5" />
              <span className="text-base font-semibold">Chat Gemini</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarUtils />

        <SidebarSeparator />
        {/* send all chats here */}
        <ChatList />
      </SidebarContent>
      <SidebarFooter>
        {/* render this only when clerkId exists and isSignedIn else LoginButton */}
        <UserInfo user={data.user} />
        {/* <LoginButton /> */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
