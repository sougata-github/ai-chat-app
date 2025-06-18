"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDots, IconTrash } from "@tabler/icons-react";
import { Edit, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeleteChatModal from "../modals/DeleteChatModal";
import ChatRenameModal from "../modals/ChatRenameModal";

export const ChatItemSkeleton = () => {
  return <Skeleton className="h-6 rounded-md w-full" />;
};

const ChatItem = () => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);

  const { isMobile } = useSidebar();

  return (
    <>
      <ChatRenameModal
        open={openRenameModal}
        onOpenChange={setOpenRenameModal}
        onCancel={() => setOpenRenameModal(false)}
      />
      <DeleteChatModal
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
      />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link prefetch href="/chat">
            untitled
          </Link>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              showOnHover
              className="data-[state=open]:bg-accent rounded-sm"
            >
              <IconDots />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-24 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            <DropdownMenuItem>
              <RefreshCcw />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenRenameModal(true)}>
              <Edit />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setOpenDeleteModal(true)}
            >
              <IconTrash />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </>
  );
};

export default ChatItem;
