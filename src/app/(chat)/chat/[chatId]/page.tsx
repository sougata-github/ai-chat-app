import { getChatById, getMessagesByChatId } from "@/lib/chat";
import { getChatModelFromCookies } from "@/lib/model";
import { convertToAISDKMessages } from "@/lib/utils";
import ChatView from "@/components/chat/ChatView";
import { getToolFromCookies } from "@/lib/tools";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;
  const existingChat = await getChatById(chatId);
  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

  if (!existingChat) redirect("/");

  const messages = await getMessagesByChatId(chatId);
  const initialMessages = convertToAISDKMessages(messages);

  return (
    <ChatView
      chatId={chatId}
      initialMessages={initialMessages}
      selectedTool={selectedTool}
      selectedModel={selectedModel}
    />
  );
}
