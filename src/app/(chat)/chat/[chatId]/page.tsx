import { getChatById, getMessagesByChatId } from "@/lib/chat";
import { getChatModelFromCookies } from "@/lib/model";
import { convertToAISDKMessages } from "@/lib/utils";
import ChatView from "@/components/chat/ChatView";
import { getToolFromCookies } from "@/lib/tools";
import { validate as uuidValidate } from "uuid";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const chat = await getChatById(chatId);

  if (initialMessages.length >= 2 && session?.user.id !== chat?.userId) {
    redirect("/");
  }

  return (
    <ChatView
      chatId={chatId}
      initialMessages={initialMessages}
      selectedTool={selectedTool}
      selectedModel={selectedModel}
    />
  );
}
