"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { ChatGetOneOutput } from "@/types";
import { IconRestore, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  chat: ChatGetOneOutput;
}

const ArchivedChatItem = ({ chat }: Props) => {
  const router = useRouter();

  const utils = trpc.useUtils();

  const deleteChat = trpc.chats.deleteOne.useMutation({
    onSuccess: (data) => {
      toast.success("Chat Deleted");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
      router.push("/");
    },
    onError: (error) => {
      toast.error("Failed to delete chat", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  const restoreChat = trpc.chats.restore.useMutation({
    onSuccess: (data) => {
      toast.success("Chat Restored");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
    },
    onError: (error) => {
      toast.error("Failed to restore chat", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <Link
      href={`/chat/${chat.id}`}
      className="p-1 pl-3 rounded-lg w-full flex items-center justify-between md:hover:bg-muted-foreground/5"
    >
      <div className="text-sm line-clamp-1">{chat.title}</div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => restoreChat.mutate({ chatId: chat.id })}
          disabled={restoreChat.isPending}
        >
          <IconRestore />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteChat.mutate({ chatId: chat.id })}
          disabled={deleteChat.isPending}
        >
          <IconTrash />
        </Button>
      </div>
    </Link>
  );
};

export default ArchivedChatItem;
