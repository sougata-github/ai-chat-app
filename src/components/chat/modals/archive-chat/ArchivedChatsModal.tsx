"use client";

import ResponsiveModal from "../ResponsiveModal";
import ArchivedChatList from "./ArchivedChatList";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArchivedChatsModal = ({ open, onOpenChange }: Props) => {
  return (
    <ResponsiveModal
      title="Archived Chats"
      open={open}
      onOpenChange={onOpenChange}
    >
      <ArchivedChatList />
    </ResponsiveModal>
  );
};

export default ArchivedChatsModal;
