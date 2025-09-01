"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../theme/ModeToggle";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@convex/_generated/api";

const ChatHeader = () => {
  const { chatId } = useParams();
  const chatIdString = typeof chatId === "string" ? chatId : undefined;
  const chat = useQuery(
    api.chats.getChatByUUID,
    chatIdString ? { chatId: chatIdString } : "skip"
  );

  return (
    <header className="backdrop-blur-lg sticky top-0 z-20 flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height] rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          {chat ? (
            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.4,
                },
              }}
              className="font-medium"
            >
              {chat.title}
            </motion.p>
          ) : (
            <></>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
