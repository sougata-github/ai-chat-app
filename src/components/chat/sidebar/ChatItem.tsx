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
import { ChatGetOneOutput } from "@/types";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export const ChatItemSkeleton = () => {
  return <Skeleton className="h-6 rounded-md w-full" />;
};

interface Props {
  chat: ChatGetOneOutput;
}

const ChatItem = ({ chat }: Props) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);

  const { isMobile } = useSidebar();

  const utils = trpc.useUtils();
  const archiveChat = trpc.chats.archive.useMutation({
    onSuccess: (data) => {
      toast.success("Chat Archived");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
    },
  });

  return (
    <>
      <ChatRenameModal
        chatId={chat.id}
        open={openRenameModal}
        onOpenChange={setOpenRenameModal}
        onCancel={() => setOpenRenameModal(false)}
      />
      <DeleteChatModal
        chatId={chat.id}
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
      />
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link prefetch href={`/chat/${chat.id}`}>
            {chat.title}
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
            <DropdownMenuItem
              onClick={() => {
                archiveChat.mutate({ chatId: chat.id });
              }}
            >
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
