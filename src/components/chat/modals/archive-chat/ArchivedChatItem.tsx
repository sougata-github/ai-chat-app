"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { ChatGetOneOutput } from "@/types";
import { IconArrowCurveRight, IconTrash } from "@tabler/icons-react";
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
      router.push("/chat");
    },
  });

  const restoreChat = trpc.chats.deleteOne.useMutation({
    onSuccess: (data) => {
      toast.success("Chat Restored");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
    },
  });

  return (
    <Link
      prefetch
      href={`/chat/${chat.id}`}
      className="p-2 rounded-md w-full flex items-center justify-between group md:hover:bg-muted-foreground/5"
    >
      <div className="text-base line-clamp-1">{chat.title}</div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => restoreChat.mutate({ chatId: chat.id })}
          disabled={restoreChat.isPending}
          className="md:group-hover:opacity-100 opacity-0"
        >
          <IconArrowCurveRight />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteChat.mutate({ chatId: chat.id })}
          disabled={deleteChat.isPending}
          className="md:group-hover:opacity-100 opacity-0"
        >
          <IconTrash />
        </Button>
      </div>
    </Link>
  );
};

export default ArchivedChatItem;
