"use client";

import { Button } from "@/components/ui/button";
import ResponsiveModal from "./ResponsiveModal";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  chatId: string; //uuid
}

const DeleteChatModal = ({ open, onOpenChange, onCancel, chatId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const deleteChat = useMutation(api.chats.deleteOne);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (chatId: string) => {
    try {
      if (pathname === `chat/${chatId}`) {
        router.replace("/");
      }
      setIsDeleting(true);
      await deleteChat({ chatId });
      onCancel();
      toast.success("Chat Deleted");
    } catch (error) {
      console.log((error as Error).message);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

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
            onClick={() => handleDelete(chatId)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin transition" />
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
