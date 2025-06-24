import { getChatById, getMessagesByChatId } from "@/lib/chat";
import { convertToAISDKMessages } from "@/lib/utils";
import ChatView from "@/components/chat/ChatView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;
  const existingChat = await getChatById(chatId);

  if (!existingChat) redirect("/");

  const messages = await getMessagesByChatId(chatId);

  const initialMessages = convertToAISDKMessages(messages);

  return <ChatView chatId={chatId} initialMessages={initialMessages} />;
}
