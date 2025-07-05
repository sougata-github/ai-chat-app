import { getChatModelFromCookies } from "@/lib/model";
import ChatView from "@/components/chat/ChatView";
import { getToolFromCookies } from "@/lib/tools";
import { v4 as uuidv4 } from "uuid";

export default async function ChatPage() {
  const chatId = uuidv4();
  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  return (
    <ChatView
      chatId={chatId}
      initialMessages={[]}
      selectedTool={selectedTool}
      selectedModel={selectedModel}
    />
  );
}
