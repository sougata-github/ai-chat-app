import ChatView from "@/components/chat/ChatView";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const chatId = uuidv4();

  return <ChatView chatId={chatId} initialMessages={[]} />;
}
