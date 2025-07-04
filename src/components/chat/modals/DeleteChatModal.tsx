"use client";

import { Button } from "@/components/ui/button";
import ResponsiveModal from "./ResponsiveModal";
import { ChatGetOneOutput } from "@/types";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  chatId: ChatGetOneOutput["id"];
}

const DeleteChatModal = ({ open, onOpenChange, onCancel, chatId }: Props) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const deleteChat = trpc.chats.deleteOne.useMutation({
    onSuccess: () => {
      onCancel();
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

  return (
    <ResponsiveModal
      title="Delete Chat"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-4 max-md:px-4 max-w-lg mx-auto py-5">
        Are you sure you want to delete this chat? This action is permanent and
        cannot be undone.
        <div className="flex flex-col md:flex-row items-centers md:justify-end gap-2">
          <Button
            variant="secondary"
            className="w-full md:w-fit"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="transition-all sm:w-20"
            variant="destructive"
            onClick={() => deleteChat.mutate({ chatId })}
            disabled={deleteChat.isPending}
          >
            {deleteChat.isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin transition" />
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default DeleteChatModal;
