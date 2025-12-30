"use client";

import ChatView from "@/components/chat/ChatView";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const [chatId] = useState(() => uuidv4());

  return <ChatView chatId={chatId} autoResume={false} chatStatus={undefined} />;
}
