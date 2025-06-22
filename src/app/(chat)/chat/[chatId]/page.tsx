import MessagesView from "@/components/messages/MessagesView";
import { getChatById, getMessagesByChatId } from "@/lib/chat";
import { convertToAISDKMessages } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;
  const existingChat = await getChatById(chatId);

  if (!existingChat) redirect("/chat");

  const messages = await getMessagesByChatId(chatId);

  const initialMessages = convertToAISDKMessages(messages);

  return <MessagesView chatId={chatId} initialMessages={initialMessages} />;
}
