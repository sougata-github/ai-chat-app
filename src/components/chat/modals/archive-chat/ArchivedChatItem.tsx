"use client";

import { Button } from "@/components/ui/button";
import { chatGetManyOutput } from "@/types";
import { api } from "@convex/_generated/api";
import { IconRestore, IconTrash } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  chat: chatGetManyOutput;
  onOpenChange: (open: boolean) => void;
}

const ArchivedChatItem = ({ chat, onOpenChange }: Props) => {
  const router = useRouter();

  const deleteChat = useMutation(api.chats.deleteOne);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async (chatId: string) => {
    try {
      setIsDeleting(true);
      await deleteChat({ chatId });
      toast.success("Chat Deleted");
      onOpenChange(false);
      router.replace("/");
    } catch (error) {
      console.log((error as Error).message);
      toast.error("Failed to delete chat");
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreChat = useMutation(api.chats.restore);
  const [isRestoring, setIsRestoring] = useState(false);
  const handleRestore = async (chatId: string) => {
    try {
      setIsRestoring(true);
      await restoreChat({ chatId });
      toast.success("Chat Restored");
    } catch (error) {
      console.log((error as Error).message);
      toast.error("Failed to restore chat");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-1 sm:pl-3 rounded-lg w-full flex items-center justify-between md:hover:bg-muted-foreground/5">
      <span>{chat?.title}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (chat) {
              handleRestore(chat.id);
            }
          }}
          disabled={isRestoring}
        >
          <IconRestore />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (chat) {
              handleDelete(chat.id);
            }
          }}
          disabled={isDeleting}
        >
          <IconTrash />
        </Button>
      </div>
    </div>
  );
};

export default ArchivedChatItem;
