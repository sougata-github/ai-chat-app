"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../theme/ModeToggle";
import ShareButton from "./ShareButton";

import { useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

const ChatHeader = () => {
  const { chatId } = useParams();

  const chatIdString = typeof chatId === "string" ? chatId : undefined;

  const { data, isLoading } = trpc.chats.getOne.useQuery(
    { chatId: chatIdString as string },
    {
      enabled: !!chatIdString,
    }
  );

  return (
    <header className="backdrop-blur-lg sticky top-0 z-20 py-8 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        {isLoading ? (
          <Loader2 className="animate-spin size-5 transition" />
        ) : data && data.title ? (
          <h1 className="text-base md:text-lg font-semibold">{data.title}</h1>
        ) : (
          <h1 className="text-lg font-semibold">Chat</h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {!isLoading && data && !data.archived && (
            <ShareButton chatId={chatIdString} />
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
