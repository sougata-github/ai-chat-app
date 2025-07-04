import { getChatModelFromCookies } from "@/lib/model";
import { getToolModeFromCookies } from "@/lib/tools";
import ChatView from "@/components/chat/ChatView";
import { v4 as uuidv4 } from "uuid";

export default async function ChatPage() {
  const chatId = uuidv4();
  const selectedMode = await getToolModeFromCookies();
  const selectedModel = await getChatModelFromCookies();

  return (
    <ChatView
      chatId={chatId}
      initialMessages={[]}
      selectedMode={selectedMode}
      selectedModel={selectedModel}
    />
  );
}
