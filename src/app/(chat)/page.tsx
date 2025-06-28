import { getChatModelFromCookies } from "@/lib/model";
import ChatView from "@/components/chat/ChatView";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const chatId = uuidv4();
  const selectedModel = await getChatModelFromCookies();

  return (
    <ChatView
      chatId={chatId}
      initialMessages={[]}
      selectedModel={selectedModel}
    />
  );
}
