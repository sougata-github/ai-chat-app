import { getChatById, getMessagesByChatId } from "@/lib/chat";
import { getChatModelFromCookies } from "@/lib/model";
import { getToolModeFromCookies } from "@/lib/tools";
import { convertToAISDKMessages } from "@/lib/utils";
import ChatView from "@/components/chat/ChatView";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;
  const existingChat = await getChatById(chatId);
  const selectedMode = await getToolModeFromCookies();
  const selectedModel = await getChatModelFromCookies();

  if (!existingChat) redirect("/");

  const messages = await getMessagesByChatId(chatId);
  const initialMessages = convertToAISDKMessages(messages);

  return (
    <ChatView
      chatId={chatId}
      initialMessages={initialMessages}
      selectedMode={selectedMode}
      selectedModel={selectedModel}
    />
  );
}
