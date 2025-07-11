"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../theme/ModeToggle";
import ShareButton from "./ShareButton";

import { useParams } from "next/navigation";

const ChatHeader = () => {
  const { chatId } = useParams();
  const chatIdString = typeof chatId === "string" ? chatId : undefined;

  return (
    <header className="backdrop-blur-lg sticky top-0 z-20 flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height] rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-4">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {chatId && <ShareButton chatId={chatIdString} />}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
