import { getChatModelFromCookies } from "@/lib/model";
import { convertToAISDKMessages } from "@/lib/utils";
import ChatView from "@/components/chat/ChatView";
import { getToolFromCookies } from "@/lib/tools";
import { getMessagesByChatId } from "@/lib/chat";
import { validate as uuidValidate } from "uuid";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ chatId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;

  if (!uuidValidate(chatId)) return redirect("/");

  const selectedTool = await getToolFromCookies();
  const selectedModel = await getChatModelFromCookies();

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
