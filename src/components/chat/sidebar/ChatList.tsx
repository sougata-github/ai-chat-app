import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

import ChatItem from "./ChatItem";

const ChatList = () => {
  return (
    <SidebarGroup className="overflow-y-auto">
      <SidebarGroupContent className="flex flex-col gap-2 pb-20">
        <SidebarMenu>
          {
            //flat map over pages
            [...new Array(5)].fill(0).map((_, index) => (
              <ChatItem key={index} />
            ))
          }
        </SidebarMenu>
      </SidebarGroupContent>
      {/* Infinite Scroll */}
    </SidebarGroup>
  );
};

export default ChatList;
