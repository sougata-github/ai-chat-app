"use client";

import { Button } from "@/components/ui/button";
import ResponsiveModal from "./ResponsiveModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  //will get chatId
}

const DeleteChatModal = ({ open, onOpenChange, onCancel }: Props) => {
  return (
    <ResponsiveModal
      title="Delete Chat"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-4 max-md:px-4 max-w-lg mx-auto max-md:py-5">
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
          <Button className="w-full md:w-fit" variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default DeleteChatModal;
