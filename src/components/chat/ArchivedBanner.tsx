"use client";

import { IconRestore } from "@tabler/icons-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PanelLeft, Trash2Icon } from "lucide-react";
import { useSidebar } from "../ui/sidebar";

interface Props {
  chatId: string;
}

const ArchivedBanner = ({ chatId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { toggleSidebar } = useSidebar();

  const deleteChat = trpc.chats.deleteOne.useMutation({
    onSuccess: () => {
      toast.success("Chat Deleted");
      utils.chats.getMany.invalidate();
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
      toast.error("Failed to delete chat", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div className="rounded-t-xl flex justify-between p-4 items-center w-full bg-destructive">
      <button
        onClick={toggleSidebar}
        disabled={deleteChat.isPending}
        className="p-1 w-fit text-sm md:hover:bg-foreground/15 transition duration-300 rounded text-background"
      >
        <PanelLeft className="size-4" />
      </button>

      <div className="w-full text-background text-center text-sm dark:text-foreground flex items-center justify-center gap-5 z-20">
        This chat is currently archived
        <div className="flex flex-row items-centers gap-2">
          <button
            onClick={() => restoreChat.mutate({ chatId })}
            disabled={restoreChat.isPending}
            className="p-1 w-fit text-sm md:hover:bg-foreground/15 transition duration-300 rounded"
          >
            <IconRestore className="size-4" />
          </button>
          <button
            onClick={() => deleteChat.mutate({ chatId })}
            disabled={deleteChat.isPending}
            className="p-1 w-fit text-sm md:hover:bg-foreground/15 transition duration-300 rounded"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivedBanner;
