import ChatView from "@/components/chat/ChatView";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const chatId = uuidv4();

  return <ChatView chatId={chatId} initialMessages={[]} />;
}
