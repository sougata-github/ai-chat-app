"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Image as ImageIcon, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ArchivedChatsModal from "../modals/archive-chat/ArchivedChatsModal";
import SearchCommand from "../modals/SearchCommand";

const SidebarUtils = () => {
  const [openArchivedChats, setOpenArchivedChats] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <>
      <SearchCommand open={openSearch} onOpenChange={setOpenSearch} />
      <ArchivedChatsModal
        open={openArchivedChats}
        onOpenChange={setOpenArchivedChats}
      />

      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          >
            <Link href="/">
              <span>New Chat</span>
            </Link>
          </Button>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="gap-2"
                onClick={() => setOpenArchivedChats(true)}
              >
                <RefreshCw />
                <span className="font-medium">Archived Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="gap-2"
                onClick={() => setOpenSearch(true)}
              >
                <Search />
                <span className="font-medium">Search Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/library">
                <SidebarMenuButton className="gap-2">
                  <ImageIcon /> Library
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default SidebarUtils;
