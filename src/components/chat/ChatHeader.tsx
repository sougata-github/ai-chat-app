"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../theme/ModeToggle";
import ShareButton from "./ShareButton";

// import { useParams } from "next/navigation";

const ChatHeader = () => {
  // const params = useParams();

  //todo: fetch chat.getOne procedure using chatId (params.chatId);

  // title  = chat.title ?? "Chat";

  return (
    <header className="backdrop-blur-lg sticky top-0 z-20 py-8 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold">Chat</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {/* pass chatId here */}
          {/* render only if searchParams exist */}
          <ShareButton />
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
