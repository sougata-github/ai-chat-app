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
import { Edit, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeleteChatModal from "../modals/DeleteChatModal";
import ChatRenameModal from "../modals/ChatRenameModal";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { chatGetManyOutput } from "@/types";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export const ChatItemSkeleton = () => {
  return <Skeleton className="h-6 rounded-md w-full" />;
};

interface Props {
  chat: chatGetManyOutput;
}

const ChatItem = ({ chat }: Props) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const { isMobile } = useSidebar();

  const pathname = usePathname();
  const router = useRouter();

  const archiveChat = useMutation(api.chats.archive);
  const [isLoading, setIsLoading] = useState(false);

  const onArchive = async (chatId: Id<"chats">) => {
    try {
      setIsLoading(true);
      await archiveChat({ chatId });
      toast.success("Chat Archived");
      router.replace("/");
    } catch (error) {
      console.log((error as Error).message);
      toast.error("Failed to archive chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatRenameModal
        chat={chat}
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
        <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`}>
          <div>
            <Link href={`/chat/${chat.id}`} className="truncate font-medium">
              {chat.title}
            </Link>
          </div>
        </SidebarMenuButton>
        {chat.status === "streaming" ? (
          <SidebarMenuAction>
            <Loader2 className="size-4 animate-spin transition" />
          </SidebarMenuAction>
        ) : (
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
                  onArchive(chat._id);
                }}
                disabled={isLoading}
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
        )}
      </SidebarMenuItem>
    </>
  );
};

export default ChatItem;
