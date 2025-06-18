import { isChatPresent } from "@/lib/chat/isChatPresent";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ chatId: string }>;
}

export const dynamic = "force-dynamic";

export default async function MessagesPage({ params }: Props) {
  const { chatId } = await params;
  const existingChat = await isChatPresent(chatId);

  if (!existingChat) redirect("/chat");

  // todo: prefetch chat.getOne and messages.getMany

  return (
    <div>
      {chatId}
      MessageView
    </div>
  );
}
